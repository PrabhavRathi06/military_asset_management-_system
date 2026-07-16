// =============================================
// utils/auditLogger.js
// Helper function to create Audit Log entries
//
// Call this from any controller whenever
// an important action happens (create, update, delete, login)
//
// Usage:
//   await createAuditLog({
//     userId: req.user._id,
//     action: 'CREATE',
//     module: 'Purchase',
//     referenceId: newPurchase._id,
//     description: `Created purchase of ${quantity} ${assetName} at ${baseName}`,
//     newData: newPurchase,
//   });
// =============================================

const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({
  userId,
  action,
  module,
  referenceId = null,
  description,
  oldData = null,
  newData = null,
}) => {
  try {
    await AuditLog.create({
      userId,
      action,
      module,
      referenceId,
      description,
      oldData,
      newData,
      timestamp: new Date(),
    });
  } catch (error) {
    // Audit log failure should NOT crash the main operation
    // Just log the error to console
    console.error('Audit log error:', error.message);
  }
};

module.exports = createAuditLog;
