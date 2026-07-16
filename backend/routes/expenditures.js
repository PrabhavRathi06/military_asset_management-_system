// =============================================
// routes/expenditures.js
// Expenditure Routes
//
// POST /api/expenditures  → Record an expenditure (Admin, BaseCommander only)
// GET  /api/expenditures  → List expenditures with filters
// =============================================

const express = require('express');
const router = express.Router();

const { createExpenditure, getExpenditures } = require('../controllers/expenditureController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Only Admin and BaseCommander can access expenditures
// LogisticsOfficer is explicitly excluded
router.post('/', protect, authorize('Admin', 'BaseCommander'), createExpenditure);
router.get('/', protect, authorize('Admin', 'BaseCommander'), getExpenditures);

module.exports = router;
