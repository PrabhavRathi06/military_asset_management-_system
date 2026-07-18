// =============================================
// server.js
// Main entry point for the backend server
// This file:
//   1. Loads environment variables
//   2. Connects to MongoDB
//   3. Sets up Express with middleware
//   4. Registers all API routes
//   5. Starts the server
// =============================================

// Load environment variables from .env file FIRST (before anything else)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize the Express application
const app = express();

// -----------------------------------------------
// Connect to MongoDB Atlas
// -----------------------------------------------
connectDB();

// -----------------------------------------------
// Global Middleware
// Middleware runs on EVERY request before hitting routes
// -----------------------------------------------

// CORS: Allow any frontend origin to call this backend
// We use JWT in Authorization headers (not cookies) so
// we don't need credentials:true — this keeps it simple and portable
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// Parse URL-encoded form data (for HTML forms)
app.use(express.urlencoded({ extended: false }));

// -----------------------------------------------
// API Routes
// Each feature has its own route file
// We'll add more routes as we build each part
// -----------------------------------------------

// Simple health check route - tells us the server is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🪖 Military Asset Management API is running!',
    version: '1.0.0',
  });
});

// Auth routes (login, register) - Part 2
app.use('/api/auth', require('./routes/auth'));

// Admin routes (manage users, bases, assets) - Part 2
app.use('/api/admin', require('./routes/admin'));

// Dashboard routes - Part 3
app.use('/api/dashboard', require('./routes/dashboard'));

// Purchases routes - Part 4
app.use('/api/purchases', require('./routes/purchases'));

// Transfers routes - Part 5
app.use('/api/transfers', require('./routes/transfers'));

// Assignments routes - Part 6
app.use('/api/assignments', require('./routes/assignments'));

// Expenditures routes - Part 6
app.use('/api/expenditures', require('./routes/expenditures'));

// Audit Logs routes - Part 7
app.use('/api/audit-logs', require('./routes/auditLogs'));



// -----------------------------------------------
// 404 Handler - if no route matched
// -----------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// -----------------------------------------------
// Global Error Handler
// If any route throws an error, it comes here
// -----------------------------------------------
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// -----------------------------------------------
// Start the server
// -----------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});
