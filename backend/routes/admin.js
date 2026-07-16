// =============================================
// routes/admin.js
// Admin Routes - all require authentication
//
// Users:  GET/POST  /api/admin/users
//         DELETE    /api/admin/users/:id
// Bases:  GET/POST  /api/admin/bases
//         DELETE    /api/admin/bases/:id
// Assets: GET/POST  /api/admin/assets
//         DELETE    /api/admin/assets/:id
// =============================================

const express = require('express');
const router = express.Router();

const {
  getAllUsers, createUser, deleteUser,
  getAllBases, createBase, deleteBase,
  getAllAssets, createAsset, deleteAsset,
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ---- USER ROUTES ----
// Only Admin can manage users
router.get('/users', protect, authorize('Admin'), getAllUsers);
router.post('/users', protect, authorize('Admin'), createUser);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

// ---- BASE ROUTES ----
// All roles can GET bases (needed in dropdown forms)
// Only Admin can CREATE or DELETE bases
router.get('/bases', protect, getAllBases);
router.post('/bases', protect, authorize('Admin'), createBase);
router.delete('/bases/:id', protect, authorize('Admin'), deleteBase);

// ---- ASSET TYPE ROUTES ----
// All roles can GET asset types (needed in dropdown forms)
// Only Admin can CREATE or DELETE asset types
router.get('/assets', protect, getAllAssets);
router.post('/assets', protect, authorize('Admin'), createAsset);
router.delete('/assets/:id', protect, authorize('Admin'), deleteAsset);

module.exports = router;
