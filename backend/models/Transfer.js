// =============================================
// models/Transfer.js
// Records asset transfers between two bases
// When a transfer is recorded:
//   → fromBase inventory.currentStock decreases by quantity
//   → toBase inventory.currentStock increases by quantity
// =============================================

const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    // What asset is being transferred
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },

    // The base SENDING the assets
    fromBaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Source base is required'],
    },

    // The base RECEIVING the assets
    toBaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Destination base is required'],
    },

    // How many units are being transferred
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    // Date when the transfer happened
    transferDate: {
      type: Date,
      required: [true, 'Transfer date is required'],
      default: Date.now,
    },

    // Any notes about why this transfer is happening
    remarks: {
      type: String,
      trim: true,
      default: '',
    },

    // Who initiated/recorded this transfer
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transfer', transferSchema);
