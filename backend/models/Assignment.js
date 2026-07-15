// =============================================
// models/Assignment.js
// Records when assets are assigned to personnel or units
// Example: Giving a rifle to a soldier
// When assigned:
//   → inventory.currentStock decreases by quantity
// =============================================

const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    // What asset is being assigned
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },

    // Which base the asset is coming from
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Base is required'],
    },

    // How many units are being assigned
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    // Name or unit of the person receiving the asset
    // e.g., "Sgt. John Smith" or "Alpha Company"
    assignedTo: {
      type: String,
      required: [true, 'Assigned to is required'],
      trim: true,
    },

    // Who recorded this assignment (links to User)
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Date of assignment
    assignmentDate: {
      type: Date,
      required: [true, 'Assignment date is required'],
      default: Date.now,
    },

    // Any notes about this assignment
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
