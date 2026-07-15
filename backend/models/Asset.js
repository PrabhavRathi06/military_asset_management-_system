// =============================================
// models/Asset.js
// Defines the structure of an Asset (Master Data)
// An Asset is the "type" of equipment (e.g., M16 Rifle)
// Individual quantities are tracked in the Inventory model
// =============================================

const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    // Name of the asset (e.g., "M16 Rifle", "Humvee", "9mm Ammo")
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },

    // Category/type of the asset
    type: {
      type: String,
      enum: ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'],
      required: [true, 'Asset type is required'],
    },

    // Unit of measurement (e.g., "Piece", "Box", "Vehicle", "Round")
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },

    // Optional description of the asset
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Asset', assetSchema);
