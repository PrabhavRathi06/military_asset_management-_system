// =============================================
// controllers/adminController.js
// Admin-only operations:
//   - Manage Users (create, list, update, delete)
//   - Manage Bases (create, list)
//   - Manage Assets/Equipment Types (create, list)
// =============================================

const User = require('../models/User');
const Base = require('../models/Base');
const Asset = require('../models/Asset');
const createAuditLog = require('../utils/auditLogger');

// ================= USER MANAGEMENT =================

// @route  GET /api/admin/users
// @access Admin only
const getAllUsers = async (req, res) => {
  try {
    // Get all users, populate their base info
    const users = await User.find()
      .select('-passwordHash')
      .populate('baseId', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/admin/users
// @access Admin only
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, baseId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      baseId: role === 'Admin' ? null : baseId,
    });

    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      module: 'User',
      referenceId: user._id,
      description: `Admin created user: ${user.name} (${user.role})`,
      newData: { name: user.name, email: user.email, role: user.role },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, baseId: user.baseId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/admin/users/:id
// @access Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'DELETE',
      module: 'User',
      referenceId: req.params.id,
      description: `Admin deleted user: ${user.name}`,
      oldData: { name: user.name, email: user.email, role: user.role },
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= BASE MANAGEMENT =================

// @route  GET /api/admin/bases
// @access Admin, BaseCommander, LogisticsOfficer (all logged-in users need base list)
const getAllBases = async (req, res) => {
  try {
    const bases = await Base.find().sort({ name: 1 });
    res.json({ success: true, count: bases.length, bases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/admin/bases
// @access Admin only
const createBase = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Name and location are required' });
    }

    const base = await Base.create({ name, location });

    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      module: 'Base',
      referenceId: base._id,
      description: `Created base: ${base.name} at ${base.location}`,
      newData: base,
    });

    res.status(201).json({ success: true, message: 'Base created successfully', base });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/admin/bases/:id
// @access Admin only
const deleteBase = async (req, res) => {
  try {
    const base = await Base.findByIdAndDelete(req.params.id);
    if (!base) {
      return res.status(404).json({ success: false, message: 'Base not found' });
    }
    res.json({ success: true, message: 'Base deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= ASSET TYPE MANAGEMENT =================

// @route  GET /api/admin/assets
// @access All logged-in users (needed in forms to pick asset type)
const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ type: 1, name: 1 });
    res.json({ success: true, count: assets.length, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/admin/assets
// @access Admin only
const createAsset = async (req, res) => {
  try {
    const { name, type, unit, description } = req.body;

    if (!name || !type || !unit) {
      return res.status(400).json({ success: false, message: 'Name, type, and unit are required' });
    }

    const asset = await Asset.create({ name, type, unit, description });

    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      module: 'Asset',
      referenceId: asset._id,
      description: `Created asset type: ${asset.name} (${asset.type})`,
      newData: asset,
    });

    res.status(201).json({ success: true, message: 'Asset type created successfully', asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  DELETE /api/admin/assets/:id
// @access Admin only
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers, createUser, deleteUser,
  getAllBases, createBase, deleteBase,
  getAllAssets, createAsset, deleteAsset,
};
