// =============================================
// controllers/expenditureController.js
// Handles all Expenditure operations
//
// Expenditures = assets consumed, damaged, destroyed, expired, or lost
// Example: 500 rounds of ammo used in training
//
// CREATE:
//   → Validates base has enough stock
//   → Deducts quantity from inventory.currentStock
//   → Creates audit log entry
//
// LIST: Returns expenditures with optional filters
// =============================================

const Expenditure = require('../models/Expenditure');
const Inventory = require('../models/Inventory');
const Asset = require('../models/Asset');
const Base = require('../models/Base');
const createAuditLog = require('../utils/auditLogger');

// -----------------------------------------------
// @route  POST /api/expenditures
// @access Admin, BaseCommander
// @desc   Record assets as expended
// -----------------------------------------------
const createExpenditure = async (req, res) => {
  try {
    const { assetId, baseId, quantity, reason, expenditureDate, remarks } = req.body;

    // ---- Validate required fields ----
    if (!assetId || !baseId || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Asset, base, quantity, and reason are required',
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    const validReasons = ['Used', 'Damaged', 'Destroyed', 'Expired', 'Lost'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Reason must be one of: ${validReasons.join(', ')}`,
      });
    }

    // ---- RBAC: BaseCommander can only expend from their own base ----
    if (req.user.role === 'BaseCommander') {
      const userBaseId = req.user.baseId?._id?.toString() || req.user.baseId?.toString();
      if (userBaseId !== baseId) {
        return res.status(403).json({
          success: false,
          message: 'You can only record expenditures for your own base',
        });
      }
    }

    // ---- Verify asset and base exist ----
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const base = await Base.findById(baseId);
    if (!base) {
      return res.status(404).json({ success: false, message: 'Base not found' });
    }

    // ---- Check sufficient stock ----
    const inventory = await Inventory.findOne({ assetId, baseId });
    if (!inventory || inventory.currentStock < Number(quantity)) {
      const available = inventory ? inventory.currentStock : 0;
      return res.status(400).json({
        success: false,
        message: `Insufficient stock at ${base.name}. Available: ${available} ${asset.unit}(s), Requested: ${quantity}`,
      });
    }

    // ---- Create expenditure record ----
    const expenditure = await Expenditure.create({
      assetId,
      baseId,
      quantity: Number(quantity),
      reason,
      expendedBy: req.user._id,
      expenditureDate: expenditureDate || new Date(),
      remarks: remarks || '',
    });

    // ---- Deduct from inventory ----
    inventory.currentStock -= Number(quantity);
    inventory.lastUpdated = new Date();
    await inventory.save();

    // ---- Create Audit Log ----
    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      module: 'Expenditure',
      referenceId: expenditure._id,
      description: `Expended ${quantity} ${asset.unit}(s) of ${asset.name} at ${base.name} — Reason: ${reason}`,
      newData: {
        asset: asset.name,
        base: base.name,
        quantity,
        reason,
        expenditureDate,
      },
    });

    // ---- Return populated result ----
    const populated = await Expenditure.findById(expenditure._id)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('expendedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Recorded expenditure of ${quantity} ${asset.name}(s) — ${reason}`,
      expenditure: populated,
    });
  } catch (error) {
    console.error('Create Expenditure Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route  GET /api/expenditures
// @access Admin, BaseCommander
// @desc   List expenditures with optional filters
// -----------------------------------------------
const getExpenditures = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType, reason } = req.query;

    const filter = {};

    // Base filter (role-based)
    if (req.user.role === 'Admin') {
      if (baseId) filter.baseId = baseId;
    } else {
      filter.baseId = req.user.baseId?._id || req.user.baseId;
    }

    // Date filter
    if (startDate || endDate) {
      filter.expenditureDate = {};
      if (startDate) filter.expenditureDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.expenditureDate.$lte = end;
      }
    }

    // Asset type filter
    if (assetType) {
      const matchingAssets = await Asset.find({ type: assetType }).select('_id');
      filter.assetId = { $in: matchingAssets.map((a) => a._id) };
    }

    // Reason filter (optional)
    if (reason) filter.reason = reason;

    const expenditures = await Expenditure.find(filter)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('expendedBy', 'name email')
      .sort({ expenditureDate: -1 });

    res.json({ success: true, count: expenditures.length, expenditures });
  } catch (error) {
    console.error('Get Expenditures Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createExpenditure, getExpenditures };
