// =============================================
// routes/transfers.js
// Transfer Routes
//
// POST /api/transfers       → Create a transfer (Admin, BaseCommander, LogisticsOfficer)
// GET  /api/transfers       → List all transfers with filters
// GET  /api/transfers/:id   → Get one transfer by ID
// =============================================

const express = require('express');
const router = express.Router();

const { createTransfer, getTransfers, getTransferById } = require('../controllers/transferController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All 3 roles can initiate and view transfers
router.post('/', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), createTransfer);
router.get('/', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), getTransfers);
router.get('/:id', protect, authorize('Admin', 'BaseCommander', 'LogisticsOfficer'), getTransferById);

module.exports = router;
