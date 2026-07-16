// =============================================
// routes/auth.js
// Authentication Routes
//
// POST /api/auth/register  → Create new user
// POST /api/auth/login     → Login and get token
// GET  /api/auth/me        → Get current user info (protected)
// =============================================

const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe } = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// Public routes (no authentication needed)
router.post('/register', register);
router.post('/login', login);

// Protected route (token required)
// The 'protect' middleware runs first, then getMe
router.get('/me', protect, getMe);

module.exports = router;
