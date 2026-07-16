// =============================================
// routes/purchases.js
// Purchase Routes
//
// POST /api/purchases       → Create a purchase (Admin, BaseCommander, LogisticsOfficer)
// GET  /api/purchases       → List all purchases with filters
// GET  /api/purchases/:id   → Get one purchase by ID
// =============================================

const express = require('express');
const router = express.Router();

const { createPurchase, getPurchases, getPurchaseById } = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All 3 roles can create and view purchases
router.post('/', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), createPurchase);
router.get('/', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), getPurchases);
router.get('/:id', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), getPurchaseById);

module.exports = router;
