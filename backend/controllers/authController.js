// =============================================
// controllers/authController.js
// Handles Login and Register logic
//
// Register: Create a new user account
// Login: Verify credentials and return JWT token
// GetMe: Return currently logged-in user's info
// =============================================

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const createAuditLog = require('../utils/auditLogger');

// -----------------------------------------------
// Helper: Generate a JWT token for a given user ID
// The token expires in JWT_EXPIRE (from .env, e.g. "7d")
// -----------------------------------------------
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // Payload: store userId inside the token
    process.env.JWT_SECRET,   // Secret key to sign the token
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// -----------------------------------------------
// @route   POST /api/auth/register
// @access  Public (no token needed)
// @desc    Create a new user account
// -----------------------------------------------
const register = async (req, res) => {
  try {
    const { name, email, password, role, baseId } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // BaseCommander and LogisticsOfficer must have a baseId
    if (role !== 'Admin' && !baseId) {
      return res.status(400).json({
        success: false,
        message: 'Base is required for BaseCommander and LogisticsOfficer roles',
      });
    }

    // Create the user
    // Note: passwordHash is set to the plain password here,
    // but the User model's pre-save hook will automatically hash it
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by model middleware
      role,
      baseId: role === 'Admin' ? null : baseId,
    });

    // Generate token for the new user
    const token = generateToken(user._id);

    // Log this registration action
    await createAuditLog({
      userId: user._id,
      action: 'CREATE',
      module: 'User',
      referenceId: user._id,
      description: `New user registered: ${user.name} (${user.role})`,
      newData: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
      },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route   POST /api/auth/login
// @access  Public (no token needed)
// @desc    Login with email & password, get JWT token
// -----------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email in the database
    const user = await User.findOne({ email: email.toLowerCase() }).populate('baseId', 'name location');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare the entered password with the stored hash
    // matchPassword is a method defined in the User model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Credentials are correct! Generate JWT token
    const token = generateToken(user._id);

    // Log the login event
    await createAuditLog({
      userId: user._id,
      action: 'LOGIN',
      module: 'Auth',
      description: `User logged in: ${user.name} (${user.role})`,
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        baseId: user.baseId, // includes base name and location
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route   GET /api/auth/me
// @access  Private (requires JWT token)
// @desc    Get currently logged-in user's info
// -----------------------------------------------
const getMe = async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
