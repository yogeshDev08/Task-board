const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middlewares/auth');
const { validateCreateTask, validateUpdateTask } = require('../middlewares/validator');

// All routes require authentication
router.use(authenticate);

// Task routes
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateCreateTask, taskController.createTask);
router.put('/:id', validateUpdateTask, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
