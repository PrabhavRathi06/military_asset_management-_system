// =============================================
// api/admin.js
// API calls for fetching bases and asset types
// Used in filter dropdowns across pages
// =============================================

import axiosInstance from './axiosInstance';

// Get all bases (for dropdown filters)
export const fetchBases = () => axiosInstance.get('/admin/bases');

// Get all asset types (for dropdown filters)
export const fetchAssets = () => axiosInstance.get('/admin/assets');

// Get all users (Admin only)
export const fetchUsers = () => axiosInstance.get('/admin/users');

// Create a new base (Admin only)
export const createBase = (data) => axiosInstance.post('/admin/bases', data);

// Create a new asset type (Admin only)
export const createAsset = (data) => axiosInstance.post('/admin/assets', data);

// Create a new user (Admin only)
export const createUser = (data) => axiosInstance.post('/admin/users', data);

// Delete a user (Admin only)
export const deleteUser = (id) => axiosInstance.delete(`/admin/users/${id}`);

// Delete a base (Admin only)
export const deleteBase = (id) => axiosInstance.delete(`/admin/bases/${id}`);

// Delete an asset type (Admin only)
export const deleteAsset = (id) => axiosInstance.delete(`/admin/assets/${id}`);
