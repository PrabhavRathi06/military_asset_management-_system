// =============================================
// routes/dashboard.js
// Dashboard Routes
//
// GET /api/dashboard  → returns all KPI metrics
//   Query params (all optional):
//     ?startDate=2024-01-01
//     ?endDate=2024-12-31
//     ?baseId=<mongoId>
//     ?assetType=Weapon|Vehicle|Ammunition|Equipment|Other
// =============================================

const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All roles can access the dashboard (filtered by their role in the controller)
router.get('/', protect, getDashboardStats);

module.exports = router;
