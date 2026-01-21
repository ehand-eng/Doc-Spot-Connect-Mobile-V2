const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/mobile/:mobile
 * @desc    Check if mobile number exists and send OTP if it does
 * @access  Public
 */
router.get('/mobile/:mobile', authController.checkMobileNumber);

/**
 * @route   POST /api/users
 * @desc    Register new user
 * @access  Public
 */
router.post('/', authController.registerUser);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authMiddleware, authController.getUserProfile);

module.exports = router;
