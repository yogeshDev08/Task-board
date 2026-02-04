const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`)

    await initializeDefaultAdmin();
  } catch (error) {
    console.error('Database connection error:', error.message)
    process.exit(1);
  }
};

const initializeDefaultAdmin = async () => {
  try {
    const User = require('../models/User');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin credentials are provided
    if (!adminEmail || !adminPassword) {
      console.warn('\n⚠️  WARNING: Admin credentials not found in .env file');
      console.warn('Please add the following to your .env file:');
      console.warn('  ADMIN_EMAIL=your_admin_email@example.com');
      console.warn('  ADMIN_PASSWORD=your_secure_password\n');
      return;
    }

    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      const defaultAdmin = await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      console.log(' Default admin user created successfully');
      console.log(` Email: ${defaultAdmin.email}`);
      console.log(` Role: ${defaultAdmin.role}`);
    } else {
      console.log(' Admin user already exists');
    }
  } catch (error) {
    console.error(' Error initializing default admin:', error.message);
  }
};

module.exports = connectDB;
