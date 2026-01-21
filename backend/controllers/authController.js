const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const smsService = require('../services/smsService');

/**
 * Check if mobile number exists and send OTP if it does
 * Endpoint: GET /api/users/mobile/:mobile
 */
exports.checkMobileNumber = async (req, res) => {
    try {
        const { mobile } = req.params;

        // Validate mobile number format
        if (!mobile || !/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number'
            });
        }

        // Check if user exists
        const user = await User.findOne({ mobileNumber: mobile });

        if (user) {
            // User exists - Generate and send OTP
            const otp = smsService.generateOTP();

            // Delete any existing OTPs for this mobile number
            await OTP.deleteMany({ mobileNumber: mobile });

            // Save new OTP
            const otpDoc = new OTP({
                mobileNumber: mobile,
                otp: otp
            });
            await otpDoc.save();

            // Send OTP via SMS
            try {
                await smsService.sendOTP(mobile, otp);

                return res.status(200).json({
                    success: true,
                    userExists: true,
                    otpSent: true,
                    message: 'OTP sent successfully to your mobile number'
                });
            } catch (smsError) {
                console.error('SMS sending failed:', smsError);

                // Delete the OTP if SMS failed
                await OTP.deleteOne({ _id: otpDoc._id });

                return res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP. Please try again.'
                });
            }
        } else {
            // User doesn't exist
            return res.status(200).json({
                success: true,
                userExists: false,
                message: 'Mobile number not registered. Please register.'
            });
        }
    } catch (error) {
        console.error('Check mobile number error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

/**
 * Verify OTP for existing user
 * Endpoint: POST /api/mobile/auth/verify-otp
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        // Validate input
        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number and OTP are required'
            });
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number'
            });
        }

        if (!/^\d{4}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: 'OTP must be a 4-digit number'
            });
        }

        // Find the OTP record
        const otpRecord = await OTP.findOne({
            mobileNumber,
            isVerified: false
        }).sort({ createdAt: -1 }); // Get the most recent OTP

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP not found or already verified. Please request a new OTP.'
            });
        }

        // Check if OTP is expired
        if (otpRecord.isExpired()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check attempts limit (max 3 attempts)
        if (otpRecord.attempts >= 3) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isMatch = await otpRecord.compareOTP(otp);

        if (!isMatch) {
            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`
            });
        }

        // OTP is valid - Mark as verified and delete
        await OTP.deleteOne({ _id: otpRecord._id });

        // Find user
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register.'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                mobileNumber: user.mobileNumber
            },
            process.env.JWT_SECRET || 'your_jwt_secret_here',
            { expiresIn: '30d' } // Token valid for 30 days
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                email: user.email,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

/**
 * Register new user
 * Endpoint: POST /api/users
 */
exports.registerUser = async (req, res) => {
    try {
        const { name, mobileNumber, email } = req.body;

        // Validate input
        if (!name || !mobileNumber) {
            return res.status(400).json({
                success: false,
                message: 'Name and mobile number are required'
            });
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number'
            });
        }

        // Validate email if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ mobileNumber });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number already registered. Please login.'
            });
        }

        // Create new user
        const user = new User({
            name: name.trim(),
            mobileNumber,
            email: email ? email.trim().toLowerCase() : null,
            lastLogin: new Date()
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                mobileNumber: user.mobileNumber
            },
            process.env.JWT_SECRET || 'your_jwt_secret_here',
            { expiresIn: '30d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                email: user.email,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Register user error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number already registered. Please login.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

/**
 * Resend OTP
 * Endpoint: POST /api/mobile/auth/resend-otp
 */
exports.resendOTP = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        // Validate mobile number
        if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number'
            });
        }

        // Check if user exists
        const user = await User.findOne({ mobileNumber });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register.'
            });
        }

        // Generate new OTP
        const otp = smsService.generateOTP();

        // Delete any existing OTPs
        await OTP.deleteMany({ mobileNumber });

        // Save new OTP
        const otpDoc = new OTP({
            mobileNumber,
            otp
        });
        await otpDoc.save();

        // Send OTP via SMS
        try {
            await smsService.sendOTP(mobileNumber, otp);

            return res.status(200).json({
                success: true,
                message: 'OTP resent successfully'
            });
        } catch (smsError) {
            console.error('SMS sending failed:', smsError);

            // Delete the OTP if SMS failed
            await OTP.deleteOne({ _id: otpDoc._id });

            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

/**
 * Get user profile (requires authentication)
 * Endpoint: GET /api/users/profile
 */
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                email: user.email,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};
