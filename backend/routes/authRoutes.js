const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../middlewares/validator');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected route
router.get('/me', authenticate, authController.getMe);

module.exports = router;
