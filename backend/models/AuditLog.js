// =============================================
// models/AuditLog.js
// Records EVERY important action in the system
// This is for accountability - who did what and when
// Example: User X created a purchase of 50 rifles at Base Alpha
// =============================================

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed this action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // What type of action was performed
    // CREATE = new record added
    // UPDATE = record modified
    // DELETE = record removed
    // LOGIN  = user logged in
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'],
      required: true,
    },

    // Which part of the system was affected
    module: {
      type: String,
      enum: ['Purchase', 'Transfer', 'Assignment', 'Expenditure', 'User', 'Base', 'Asset', 'Auth'],
      required: true,
    },

    // The ID of the record that was created/updated/deleted
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // A human-readable description of what happened
    // e.g., "Created purchase of 50 M16 Rifles at Alpha Base"
    description: {
      type: String,
      required: true,
    },

    // Snapshot of the data BEFORE the change (for updates)
    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Snapshot of the data AFTER the change
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Exact time of the action
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }
  // Note: No timestamps option here because we have a custom 'timestamp' field above
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
