// =============================================
// models/Expenditure.js
// Records when assets are used up, damaged, or destroyed
// Example: Ammo fired in training, vehicle destroyed
// When expended:
//   → inventory.currentStock decreases by quantity
// =============================================

const mongoose = require('mongoose');

const expenditureSchema = new mongoose.Schema(
  {
    // What asset was expended
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },

    // Which base the asset came from
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Base is required'],
    },

    // How many units were expended
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    // Why was the asset expended?
    reason: {
      type: String,
      enum: ['Used', 'Damaged', 'Destroyed', 'Expired', 'Lost'],
      required: [true, 'Reason is required'],
    },

    // Who recorded this expenditure
    expendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Date when the expenditure occurred
    expenditureDate: {
      type: Date,
      required: [true, 'Expenditure date is required'],
      default: Date.now,
    },

    // Any extra notes about this expenditure
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

module.exports = mongoose.model('Expenditure', expenditureSchema);
