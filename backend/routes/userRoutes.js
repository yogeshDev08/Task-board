const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorizeAdmin, authorizeOwnerOrAdmin } = require('../middlewares/auth');
const { validateCreateUser } = require('../middlewares/validator');

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorizeAdmin, userController.getAllUsers);
router.post('/', authorizeAdmin, validateCreateUser, userController.createUser);

// Get user by ID (own or admin)
router.get('/:id', authorizeOwnerOrAdmin, userController.getUserById);

module.exports = router;
