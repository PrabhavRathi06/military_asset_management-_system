// =============================================
// controllers/dashboardController.js
// Dashboard Statistics API
//
// Returns these metrics (with optional filters):
//   - Opening Balance  : inventory.openingBalance (sum)
//   - Closing Balance  : Opening + Purchases + TransferIn - TransferOut - Assigned - Expended
//   - Net Movement     : Purchases + TransferIn - TransferOut
//   - Assigned         : Total assets assigned to personnel
//   - Expended         : Total assets used/damaged/destroyed
//
// Filters supported:
//   - startDate / endDate : filter transactions by date range
//   - baseId              : filter by specific base
//   - assetType           : filter by equipment type (Weapon, Vehicle, etc.)
// =============================================

const Inventory = require('../models/Inventory');
const Purchase = require('../models/Purchase');
const Transfer = require('../models/Transfer');
const Assignment = require('../models/Assignment');
const Expenditure = require('../models/Expenditure');
const Asset = require('../models/Asset');

// -----------------------------------------------
// @route  GET /api/dashboard
// @access All logged-in users
// -----------------------------------------------
const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, baseId, assetType } = req.query;

    // -----------------------------------------------
    // Step 1: Determine which BASE(S) to query
    // Admin can see all bases or filter by one
    // BaseCommander/LogisticsOfficer only see their base
    // -----------------------------------------------
    let baseFilter = {};

    if (req.user.role === 'Admin') {
      // Admin: if a baseId is given, filter by it; otherwise show all
      if (baseId) {
        baseFilter = { baseId };
      }
    } else {
      // Non-admin: force to their own base only
      baseFilter = { baseId: req.user.baseId };
    }

    // -----------------------------------------------
    // Step 2: Determine which ASSET TYPE(S) to query
    // If assetType filter is provided, find all assetIds of that type
    // -----------------------------------------------
    let assetIdFilter = null;

    if (assetType) {
      const matchingAssets = await Asset.find({ type: assetType }).select('_id');
      assetIdFilter = matchingAssets.map((a) => a._id);
    }

    // Build the inventory filter (for opening balance)
    const inventoryFilter = { ...baseFilter };
    if (assetIdFilter) {
      inventoryFilter.assetId = { $in: assetIdFilter };
    }

    // -----------------------------------------------
    // Step 3: Build DATE filter for transactions
    // -----------------------------------------------
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set end date to end of that day (23:59:59)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    // -----------------------------------------------
    // Step 4: Calculate OPENING BALANCE
    // Sum of openingBalance from inventory records
    // -----------------------------------------------
    const inventoryRecords = await Inventory.find(inventoryFilter);
    const openingBalance = inventoryRecords.reduce(
      (sum, inv) => sum + inv.openingBalance,
      0
    );

    // -----------------------------------------------
    // Step 5: Build transaction query filter
    // Used for purchases, transfers, assignments, expenditures
    // -----------------------------------------------

    // Build filter for transactions (purchases, assignments, expenditures)
    const txFilter = { ...baseFilter };
    if (assetIdFilter) txFilter.assetId = { $in: assetIdFilter };
    if (Object.keys(dateFilter).length > 0) txFilter.purchaseDate = dateFilter;

    // -----------------------------------------------
    // Step 6: Calculate PURCHASES total
    // -----------------------------------------------
    const purchaseDateFilter = Object.keys(dateFilter).length > 0
      ? { purchaseDate: dateFilter }
      : {};

    const purchaseQuery = { ...baseFilter, ...purchaseDateFilter };
    if (assetIdFilter) purchaseQuery.assetId = { $in: assetIdFilter };

    const purchases = await Purchase.find(purchaseQuery)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name')
      .populate('addedBy', 'name')
      .sort({ purchaseDate: -1 });

    const totalPurchases = purchases.reduce((sum, p) => sum + p.quantity, 0);

    // -----------------------------------------------
    // Step 7: Calculate TRANSFERS IN and TRANSFERS OUT
    // Transfer In  = transfers where toBaseId matches our base filter
    // Transfer Out = transfers where fromBaseId matches our base filter
    // -----------------------------------------------
    const transferDateFilter = Object.keys(dateFilter).length > 0
      ? { transferDate: dateFilter }
      : {};

    // Build base condition for transfers
    let transferInBaseCondition = {};
    let transferOutBaseCondition = {};

    if (req.user.role === 'Admin' && !baseId) {
      // Admin with no filter: count all transfers
      transferInBaseCondition = {};
      transferOutBaseCondition = {};
    } else {
      const targetBase = baseId || req.user.baseId?._id || req.user.baseId;
      transferInBaseCondition = { toBaseId: targetBase };
      transferOutBaseCondition = { fromBaseId: targetBase };
    }

    const assetCondition = assetIdFilter ? { assetId: { $in: assetIdFilter } } : {};

    // Transfers IN
    const transfersIn = await Transfer.find({
      ...transferInBaseCondition,
      ...assetCondition,
      ...transferDateFilter,
    })
      .populate('assetId', 'name type unit')
      .populate('fromBaseId', 'name')
      .populate('toBaseId', 'name')
      .populate('initiatedBy', 'name')
      .sort({ transferDate: -1 });

    const totalTransferIn = transfersIn.reduce((sum, t) => sum + t.quantity, 0);

    // Transfers OUT
    const transfersOut = await Transfer.find({
      ...transferOutBaseCondition,
      ...assetCondition,
      ...transferDateFilter,
    })
      .populate('assetId', 'name type unit')
      .populate('fromBaseId', 'name')
      .populate('toBaseId', 'name')
      .populate('initiatedBy', 'name')
      .sort({ transferDate: -1 });

    const totalTransferOut = transfersOut.reduce((sum, t) => sum + t.quantity, 0);

    // -----------------------------------------------
    // Step 8: Calculate ASSIGNED total
    // -----------------------------------------------
    const assignDateFilter = Object.keys(dateFilter).length > 0
      ? { assignmentDate: dateFilter }
      : {};

    const assignmentQuery = { ...baseFilter, ...assignDateFilter };
    if (assetIdFilter) assignmentQuery.assetId = { $in: assetIdFilter };

    const assignments = await Assignment.find(assignmentQuery)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name')
      .populate('assignedBy', 'name')
      .sort({ assignmentDate: -1 });

    const totalAssigned = assignments.reduce((sum, a) => sum + a.quantity, 0);

    // -----------------------------------------------
    // Step 9: Calculate EXPENDED total
    // -----------------------------------------------
    const expendDateFilter = Object.keys(dateFilter).length > 0
      ? { expenditureDate: dateFilter }
      : {};

    const expenditureQuery = { ...baseFilter, ...expendDateFilter };
    if (assetIdFilter) expenditureQuery.assetId = { $in: assetIdFilter };

    const expenditures = await Expenditure.find(expenditureQuery)
      .populate('assetId', 'name type unit')
      .populate('baseId', 'name')
      .populate('expendedBy', 'name')
      .sort({ expenditureDate: -1 });

    const totalExpended = expenditures.reduce((sum, e) => sum + e.quantity, 0);

    // -----------------------------------------------
    // Step 10: Calculate derived metrics
    // -----------------------------------------------
    const netMovement = totalPurchases + totalTransferIn - totalTransferOut;
    const closingBalance = openingBalance + netMovement - totalAssigned - totalExpended;

    // -----------------------------------------------
    // Step 11: Send response
    // -----------------------------------------------
    res.json({
      success: true,
      stats: {
        openingBalance,
        closingBalance,
        netMovement,
        totalPurchases,
        totalTransferIn,
        totalTransferOut,
        totalAssigned,
        totalExpended,
      },
      // Detail lists for the Net Movement popup (Bonus feature)
      details: {
        purchases,
        transfersIn,
        transfersOut,
      },
    });
  } catch (error) {
    console.error('Dashboard Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
