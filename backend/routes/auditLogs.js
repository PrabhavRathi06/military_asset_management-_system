// =============================================
// routes/auditLogs.js
// Audit Log Routes - Admin access only
//
// GET /api/audit-logs  → List all audit logs with filters
//   Query params: ?module=Purchase&action=CREATE&startDate=&endDate=
// =============================================

const express = require('express');
const router = express.Router();

const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Only Admin can view audit logs
router.get('/', protect, authorize('Admin'), getAuditLogs);

module.exports = router;
