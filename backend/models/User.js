// =============================================
// models/User.js
// Defines the structure of a User in the database
// =============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    // Email used for login (must be unique)
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Hashed password (never store plain text passwords!)
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },

    // Role determines what the user can see/do
    // Admin = full access
    // BaseCommander = only their base
    // LogisticsOfficer = only purchases & transfers
    role: {
      type: String,
      enum: ['Admin', 'BaseCommander', 'LogisticsOfficer'],
      required: [true, 'Role is required'],
    },

    // Which base this user belongs to (null for Admin)
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// -----------------------------------------------
// Before saving a user, hash their password
// This runs automatically before every .save()
// -----------------------------------------------
userSchema.pre('save', async function (next) {
  // Only hash the password if it was changed (or is new)
  if (!this.isModified('passwordHash')) return next();

  // bcrypt.hash(password, saltRounds) - saltRounds=10 is a good balance of security vs speed
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

// -----------------------------------------------
// Method to compare entered password with stored hash
// Used during login to verify the password
// -----------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
