const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
    validateSignup,
    validateLogin,
    validateProfile,
    validatePasswordChange
} = require('../middleware/validators');

// Public routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validateProfile, authController.updateProfile);
router.put('/password', authenticate, validatePasswordChange, authController.changePassword);

module.exports = router;
