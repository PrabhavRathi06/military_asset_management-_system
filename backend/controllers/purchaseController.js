// =============================================
// controllers/purchaseController.js
// Handles all Purchase operations
//
// CREATE: Records a new purchase + updates inventory stock
// LIST:   Returns all purchases with optional filters
// =============================================

const Purchase = require('../models/Purchase');
const Inventory = require('../models/Inventory');
const Asset = require('../models/Asset');
const Base = require('../models/Base');
const createAuditLog = require('../utils/auditLogger');

// -----------------------------------------------
// @route  POST /api/purchases
// @access Admin, BaseCommander, LogisticsOfficer
// @desc   Record a new asset purchase
// -----------------------------------------------
const createPurchase = async (req, res) => {
  try {
    const { assetId, baseId, quantity, purchaseDate, supplier, remarks } = req.body;

    // Validate required fields
    if (!assetId || !baseId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Asset, base, and quantity are required',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    // BaseCommander and LogisticsOfficer can only add purchases for THEIR base
    if (req.user.role !== 'Admin') {
      const userBaseId = req.user.baseId?._id?.toString() || req.user.baseId?.toString();
      if (userBaseId !== baseId) {
        return res.status(403).json({
          success: false,
          message: 'You can only record purchases for your own base',
        });
      }
    }

    // Verify the asset and base exist
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const base = await Base.findById(baseId);
    if (!base) {
      return res.status(404).json({ success: false, message: 'Base not found' });
    }

    // -----------------------------------------------
    // Create the purchase record
    // -----------------------------------------------
    const purchase = await Purchase.create({
      assetId,
      baseId,
      quantity: Number(quantity),
      purchaseDate: purchaseDate || new Date(),
      supplier: supplier || '',
      remarks: remarks || '',
      addedBy: req.user._id,
    });

    // -----------------------------------------------
    // Update Inventory: increase currentStock
    // If inventory record doesn't exist yet, create it
    // -----------------------------------------------
    const existingInventory = await Inventory.findOne({ assetId, baseId });

    if (existingInventory) {
      // Increment the current stock
      existingInventory.currentStock += Number(quantity);
      existingInventory.lastUpdated = new Date();
      await existingInventory.save();
    } else {
      // No inventory record yet → create one
      // Opening balance = this purchase quantity (first entry)
      await Inventory.create({
        assetId,
        baseId,
        openingBalance: Number(quantity),
        currentStock: Number(quantity),
        lastUpdated: new Date(),
      });
    }

    // -----------------------------------------------
    // Create Audit Log entry
    // -----------------------------------------------
    await createAuditLog({
      userId: req.user._id,
      action: 'CREATE',
      module: 'Purchase',
      referenceId: purchase._id,
      description: `Purchased ${quantity} ${asset.unit}(s) of ${asset.name} for ${base.name}`,
      newData: {
        asset: asset.name,
        base: base.name,
        quantity,
        supplier,
        purchaseDate,
      },
    });

    // Populate and return the full purchase details
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Purchase of ${quantity} ${asset.name}(s) recorded successfully`,
      purchase: populatedPurchase,
    });
  } catch (error) {
    console.error('Create Purchase Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route  GET /api/purchases
// @access All logged-in users (filtered by role)
// @desc   List purchases with optional filters
//   Query: ?startDate=&endDate=&baseId=&assetType=
// -----------------------------------------------
const getPurchases = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType } = req.query;

    // Build query filter object
    const filter = {};

    // ---- Base filter (role-based) ----
    if (req.user.role === 'Admin') {
      if (baseId) filter.baseId = baseId;
    } else {
      // Non-admin only sees their base
      filter.baseId = req.user.baseId?._id || req.user.baseId;
    }

    // ---- Date range filter ----
    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.purchaseDate.$lte = end;
      }
    }

    // ---- Asset type filter ----
    // If assetType given, find matching asset IDs first
    if (assetType) {
      const matchingAssets = await Asset.find({ type: assetType }).select('_id');
      filter.assetId = { $in: matchingAssets.map((a) => a._id) };
    }

    // Fetch purchases sorted by newest first
    const purchases = await Purchase.find(filter)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('addedBy', 'name email')
      .sort({ purchaseDate: -1 });

    res.json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    console.error('Get Purchases Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route  GET /api/purchases/:id
// @access All logged-in users
// @desc   Get a single purchase by ID
// -----------------------------------------------
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('addedBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    res.json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPurchase, getPurchases, getPurchaseById };
