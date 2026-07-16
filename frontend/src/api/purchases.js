// =============================================
// api/purchases.js
// API call helpers for the Purchases page
// =============================================

import axiosInstance from './axiosInstance';

// Get all purchases (with optional filters)
// params: { startDate, endDate, baseId, assetType }
export const fetchPurchases = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return axiosInstance.get('/purchases', { params: cleanParams });
};

// Create a new purchase
export const createPurchase = (data) => axiosInstance.post('/purchases', data);
