const Task = require('../models/Task');
const { AppError } = require('../middlewares/errorHandler');

exports.getAllTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, search, dueDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (dueDate) filters.dueDate = { $lte: new Date(dueDate) };
    if (search) filters.title = { $regex: search, $options: 'i' };

    // Role-based filtering: users see only their assigned/created tasks
    if (req.user.role !== 'admin') {
      query.$and = [
        {
          $or: [
            { assignedTo: req.user._id },
            { createdBy: req.user._id }
          ]
        },
        filters
      ];
    } else {
      // Admin sees all tasks, just apply filters
      Object.assign(query, filters);
    }

    // Execute query with pagination
    const tasks = await Task.find(query)
      .populate('assignedTo', 'email')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'email')
      .populate('createdBy', 'email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check authorization: users can only see their assigned/created tasks
    if (req.user.role !== 'admin' && 
        task.assignedTo?._id.toString() !== req.user._id.toString() &&
        task.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// Create task
exports.createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Convert empty string to null for assignedTo
    if (taskData.assignedTo === '') {
      taskData.assignedTo = null;
    }

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'email')
      .populate('createdBy', 'email');

    // Emit socket event for real-time update
    req.io.emit('task:created', populatedTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Authorization: only creator or assignee can update
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isCreator && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only creator or assignee can update this task.'
      });
    }

    // Update task
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    });

    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'email')
      .populate('createdBy', 'email');

    // Emit socket event for real-time update
    req.io.emit('task:updated', updatedTask);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Authorization: only admin or creator can delete
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin or creator can delete this task.'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time update
    req.io.emit('task:deleted', { id: req.params.id });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
