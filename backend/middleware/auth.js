// =============================================
// middleware/auth.js
// JWT Authentication Middleware
//
// This runs on every protected API route.
// It checks the Authorization header for a valid JWT token.
// If valid, it adds the user info to req.user
// If invalid/missing, it returns 401 Unauthorized
// =============================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as:
  // "Bearer eyJhbGciOiJIUzI1NiIsInR..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract just the token part (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key from .env
      // If the token is expired or tampered, this will throw an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the full user from DB (excluding password)
      // We use the userId stored inside the token
      req.user = await User.findById(decoded.id).select('-passwordHash').populate('baseId', 'name location');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Move to the next middleware or route handler
      next();
    } catch (error) {
      console.error('JWT Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
