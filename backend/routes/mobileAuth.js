const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /api/mobile/auth/verify-otp
 * @desc    Verify OTP and login user
 * @access  Public
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @route   POST /api/mobile/auth/resend-otp
 * @desc    Resend OTP to mobile number
 * @access  Public
 */
router.post('/resend-otp', authController.resendOTP);

module.exports = router;
