// =============================================
// controllers/auditLogController.js
// Returns audit log entries for the Admin
//
// Audit logs record EVERY important action:
//   - Who did it (userId)
//   - What action (CREATE/UPDATE/DELETE/LOGIN)
//   - Which module (Purchase, Transfer, etc.)
//   - When it happened (timestamp)
//   - What data changed (oldData, newData)
// =============================================

const AuditLog = require('../models/AuditLog');

// -----------------------------------------------
// @route  GET /api/audit-logs
// @access Admin only
// @desc   List all audit logs with optional filters
//   Query: ?module=&action=&startDate=&endDate=&limit=50
// -----------------------------------------------
const getAuditLogs = async (req, res) => {
  try {
    const { module, action, startDate, endDate, limit = 100 } = req.query;

    const filter = {};

    // Filter by module (Purchase, Transfer, Assignment, etc.)
    if (module) filter.module = module;

    // Filter by action type (CREATE, UPDATE, DELETE, LOGIN)
    if (action) filter.action = action;

    // Date range filter on timestamp
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    // Fetch logs, newest first, with userId populated
    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(Number(limit)); // Limit to avoid massive payloads

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Get Audit Logs Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAuditLogs };
