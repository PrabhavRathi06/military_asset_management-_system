// =============================================
// api/transfers.js
// API call helpers for the Transfers page
// =============================================

import axiosInstance from './axiosInstance';

// Get all transfers (with optional filters)
// params: { startDate, endDate, baseId, assetType }
export const fetchTransfers = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return axiosInstance.get('/transfers', { params: cleanParams });
};

// Create a new transfer between bases
export const createTransfer = (data) => axiosInstance.post('/transfers', data);
