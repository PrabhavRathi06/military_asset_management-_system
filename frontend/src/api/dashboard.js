// =============================================
// api/dashboard.js
// API calls for the Dashboard page
// =============================================

import axiosInstance from './axiosInstance';

// Fetch dashboard stats with optional filters
// params: { startDate, endDate, baseId, assetType }
export const fetchDashboardStats = (params = {}) => {
  // Remove empty params so URL stays clean
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return axiosInstance.get('/dashboard', { params: cleanParams });
};
