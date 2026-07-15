// =============================================
// models/Purchase.js
// Records every purchase of assets for a base
// When a purchase is recorded:
//   → inventory.currentStock increases by quantity
// =============================================

const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    // What asset was purchased
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },

    // Which base received this purchase
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Base is required'],
    },

    // How many units were purchased
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    // Date when the purchase happened
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
      default: Date.now,
    },

    // Name of the supplier (optional)
    supplier: {
      type: String,
      trim: true,
      default: '',
    },

    // Any additional notes about this purchase
    remarks: {
      type: String,
      trim: true,
      default: '',
    },

    // Who recorded this purchase (links to User)
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Purchase', purchaseSchema);
