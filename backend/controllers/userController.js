const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { query = '' } = req.query;

    // Build search query - exclude admin users, search by email
    const searchQuery = {
      role: { $ne: 'admin' },
      email: { $regex: query, $options: 'i' }
    };

    const users = await User.find(searchQuery)
      .select('_id email')
      .limit(10)
      .sort({ email: 1 });

    res.json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};
