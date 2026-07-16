// =============================================
// controllers/transferController.js
// Handles all Transfer operations
//
// CREATE: Records a transfer between two bases
//   → Validates that source base has enough stock
//   → Deducts quantity from source base inventory
//   → Adds quantity to destination base inventory
//   → Creates audit log entry
//
// LIST: Returns transfers with optional filters
// =============================================

const Transfer = require('../models/Transfer');
const Inventory = require('../models/Inventory');
const Asset = require('../models/Asset');
const Base = require('../models/Base');
const createAuditLog = require('../utils/auditLogger');

// -----------------------------------------------
// @route  POST /api/transfers
// @access Admin, BaseCommander, LogisticsOfficer
// @desc   Create an asset transfer between two bases
// -----------------------------------------------
const createTransfer = async (req, res) => {
  try {
    const { assetId, fromBaseId, toBaseId, quantity, transferDate, remarks } = req.body;

    // ---- Validate required fields ----
    if (!assetId || !fromBaseId || !toBaseId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Asset, source base, destination base, and quantity are required',
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    // ---- Cannot transfer to the same base ----
    if (fromBaseId === toBaseId) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination base cannot be the same',
      });
    }

    // ---- RBAC check ----
    // BaseCommander and LogisticsOfficer can only transfer FROM their own base
    if (req.user.role !== 'Admin') {
      const userBaseId = req.user.baseId?._id?.toString() || req.user.baseId?.toString();
      if (userBaseId !== fromBaseId) {
        return res.status(403).json({
          success: false,
          message: 'You can only initiate transfers from your own base',
        });
      }
    }

    // ---- Verify asset and both bases exist ----
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const fromBase = await Base.findById(fromBaseId);
    if (!fromBase) {
      return res.status(404).json({ success: false, message: 'Source base not found' });
    }

    const toBase = await Base.findById(toBaseId);
    if (!toBase) {
      return res.status(404).json({ success: false, message: 'Destination base not found' });
    }

    // ---- Check if source base has enough stock ----
    const sourceInventory = await Inventory.findOne({ assetId, baseId: fromBaseId });

    if (!sourceInventory || sourceInventory.currentStock < Number(quantity)) {
      const available = sourceInventory ? sourceInventory.currentStock : 0;
      return res.status(400).json({
        success: false,
        message: `Insufficient stock at ${fromBase.name}. Available: ${available} ${asset.unit}(s), Requested: ${quantity}`,
      });
    }

    // ---- All checks passed → Create the transfer record ----
    const transfer = await Transfer.create({
      assetId,
      fromBaseId,
      toBaseId,
      quantity: Number(quantity),
      transferDate: transferDate || new Date(),
      remarks: remarks || '',
      initiatedBy: req.user._id,
    });

    // ---- Update Source Base: DEDUCT stock ----
    sourceInventory.currentStock -= Number(quantity);
    sourceInventory.lastUpdated = new Date();
    await sourceInventory.save();

    // ---- Update Destination Base: ADD stock ----
    const destInventory = await Inventory.findOne({ assetId, baseId: toBaseId });

    if (destInventory) {
      // Inventory record already exists at destination → just increment
      destInventory.currentStock += Number(quantity);
      destInventory.lastUpdated = new Date();
      await destInventory.save();
    } else {
      // No inventory at destination yet → create one
      await Inventory.create({
        assetId,
        baseId: toBaseId,
        openingBalance: 0, // Opening was 0 before this transfer
        currentStock: Number(quantity),
        lastUpdated: new Date(),
      });
    }

    // ---- Create Audit Log ----
    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      module: 'Transfer',
      referenceId: transfer._id,
      description: `Transferred ${quantity} ${asset.unit}(s) of ${asset.name} from ${fromBase.name} to ${toBase.name}`,
      newData: {
        asset: asset.name,
        fromBase: fromBase.name,
        toBase: toBase.name,
        quantity,
        transferDate,
      },
    });

    // ---- Return populated transfer ----
    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('assetId', 'name type unit')
      .populate('fromBaseId', 'name location')
      .populate('toBaseId', 'name location')
      .populate('initiatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Transfer of ${quantity} ${asset.name}(s) from ${fromBase.name} to ${toBase.name} completed`,
      transfer: populatedTransfer,
    });
  } catch (error) {
    console.error('Create Transfer Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route  GET /api/transfers
// @access All logged-in users (filtered by role)
// @desc   List transfers with optional filters
//   Query: ?startDate=&endDate=&baseId=&assetType=
// -----------------------------------------------
const getTransfers = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType } = req.query;

    // Build base filter
    // Non-admin sees transfers where they are the FROM or TO base
    let baseCondition = {};

    if (req.user.role === 'Admin') {
      if (baseId) {
        // Admin filtering by specific base: show as either from or to
        baseCondition = { $or: [{ fromBaseId: baseId }, { toBaseId: baseId }] };
      }
    } else {
      // Non-admin: show transfers involving their base
      const userBaseId = req.user.baseId?._id || req.user.baseId;
      baseCondition = { $or: [{ fromBaseId: userBaseId }, { toBaseId: userBaseId }] };
    }

    // Build date filter
    let dateCondition = {};
    if (startDate || endDate) {
      dateCondition.transferDate = {};
      if (startDate) dateCondition.transferDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateCondition.transferDate.$lte = end;
      }
    }

    // Build asset type filter
    let assetCondition = {};
    if (assetType) {
      const matchingAssets = await Asset.find({ type: assetType }).select('_id');
      assetCondition.assetId = { $in: matchingAssets.map((a) => a._id) };
    }

    // Combine all conditions
    const filter = { ...baseCondition, ...dateCondition, ...assetCondition };

    const transfers = await Transfer.find(filter)
      .populate('assetId', 'name type unit')
      .populate('fromBaseId', 'name location')
      .populate('toBaseId', 'name location')
      .populate('initiatedBy', 'name email')
      .sort({ transferDate: -1 });

    res.json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error('Get Transfers Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route  GET /api/transfers/:id
// @access All logged-in users
// @desc   Get a single transfer by ID
// -----------------------------------------------
const getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('assetId', 'name type unit')
      .populate('fromBaseId', 'name location')
      .populate('toBaseId', 'name location')
      .populate('initiatedBy', 'name email');

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer not found' });
    }

    res.json({ success: true, transfer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createTransfer, getTransfers, getTransferById };
