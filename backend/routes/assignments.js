// =============================================
// routes/assignments.js
// Assignment Routes
//
// POST /api/assignments  → Create an assignment (Admin, BaseCommander only)
// GET  /api/assignments  → List assignments with filters
// =============================================

const express = require('express');
const router = express.Router();

const { createAssignment, getAssignments } = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Only Admin and BaseCommander can access assignments
// LogisticsOfficer is explicitly excluded
router.post('/', protect, authorize('Admin', 'BaseCommander'), createAssignment);
router.get('/', protect, authorize('Admin', 'BaseCommander'), getAssignments);

module.exports = router;
