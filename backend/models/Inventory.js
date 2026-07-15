// =============================================
// models/Inventory.js
// Tracks current stock of each asset at each base
// This is the "live" balance sheet
//
// Opening Balance = quantity set when base first gets the asset
// Current Stock   = latest quantity after all transactions
// =============================================

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    // Which asset this inventory record is for
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },

    // Which base this inventory is at
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: true,
    },

    // Opening balance = quantity at the START of tracking
    // Set once when inventory is first created
    openingBalance: {
      type: Number,
      required: true,
      min: [0, 'Opening balance cannot be negative'],
      default: 0,
    },

    // Current stock = real-time quantity available right now
    // Updated every time a purchase, transfer, assignment, or expenditure happens
    currentStock: {
      type: Number,
      required: true,
      min: [0, 'Current stock cannot be negative'],
      default: 0,
    },

    // When this stock level was last updated
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each base-asset combination is unique (one record per asset per base)
inventorySchema.index({ assetId: 1, baseId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
