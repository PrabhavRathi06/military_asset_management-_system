// =============================================
// controllers/assignmentController.js
// Handles all Assignment operations
//
// Assignments = issuing assets to personnel/units
// Example: Giving 10 rifles to Alpha Company
//
// CREATE:
//   → Validates source base has enough stock
//   → Deducts quantity from inventory.currentStock
//   → Creates audit log entry
//
// LIST: Returns assignments with optional filters
// =============================================

const Assignment = require('../models/Assignment');
const Inventory = require('../models/Inventory');
const Asset = require('../models/Asset');
const Base = require('../models/Base');
const createAuditLog = require('../utils/auditLogger');

// -----------------------------------------------
// @route  POST /api/assignments
// @access Admin, BaseCommander
// @desc   Assign assets to a person or unit
// -----------------------------------------------
const createAssignment = async (req, res) => {
  try {
    const { assetId, baseId, quantity, assignedTo, assignmentDate, remarks } = req.body;

    // ---- Validate required fields ----
    if (!assetId || !baseId || !quantity || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Asset, base, quantity, and assigned-to are required',
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    // ---- RBAC: BaseCommander can only assign from their own base ----
    if (req.user.role === 'BaseCommander') {
      const userBaseId = req.user.baseId?._id?.toString() || req.user.baseId?.toString();
      if (userBaseId !== baseId) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign assets from your own base',
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

    // ---- Create the assignment record ----
    const assignment = await Assignment.create({
      assetId,
      baseId,
      quantity: Number(quantity),
      assignedTo: assignedTo.trim(),
      assignedBy: req.user._id,
      assignmentDate: assignmentDate || new Date(),
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
      module: 'Assignment',
      referenceId: assignment._id,
      description: `Assigned ${quantity} ${asset.unit}(s) of ${asset.name} to "${assignedTo}" from ${base.name}`,
      newData: {
        asset: asset.name,
        base: base.name,
        quantity,
        assignedTo,
        assignmentDate,
      },
    });

    // ---- Return populated result ----
    const populated = await Assignment.findById(assignment._id)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: `Successfully assigned ${quantity} ${asset.name}(s) to "${assignedTo}"`,
      assignment: populated,
    });
  } catch (error) {
    console.error('Create Assignment Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------
// @route  GET /api/assignments
// @access Admin, BaseCommander
// @desc   List assignments with optional filters
// -----------------------------------------------
const getAssignments = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType } = req.query;

    const filter = {};

    // Base filter (role-based)
    if (req.user.role === 'Admin') {
      if (baseId) filter.baseId = baseId;
    } else {
      filter.baseId = req.user.baseId?._id || req.user.baseId;
    }

    // Date filter
    if (startDate || endDate) {
      filter.assignmentDate = {};
      if (startDate) filter.assignmentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.assignmentDate.$lte = end;
      }
    }

    // Asset type filter
    if (assetType) {
      const matchingAssets = await Asset.find({ type: assetType }).select('_id');
      filter.assetId = { $in: matchingAssets.map((a) => a._id) };
    }

    const assignments = await Assignment.find(filter)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name location')
      .populate('assignedBy', 'name email')
      .sort({ assignmentDate: -1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (error) {
    console.error('Get Assignments Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAssignment, getAssignments };
