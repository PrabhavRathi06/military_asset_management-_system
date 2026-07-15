// =============================================
// models/Base.js
// Defines the structure of an Army Base
// =============================================

const mongoose = require('mongoose');

const baseSchema = new mongoose.Schema(
  {
    // Name of the military base (e.g., "Alpha Base", "Bravo HQ")
    name: {
      type: String,
      required: [true, 'Base name is required'],
      unique: true,
      trim: true,
    },

    // Physical location of the base (e.g., "Rajasthan, India")
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
  },
  {
    // Automatically adds createdAt field
    timestamps: true,
  }
);

module.exports = mongoose.model('Base', baseSchema);
