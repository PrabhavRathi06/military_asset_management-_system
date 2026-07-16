// =============================================
// api/expenditures.js
// API call helpers for Expenditures
// =============================================

import axiosInstance from './axiosInstance';

export const fetchExpenditures = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return axiosInstance.get('/expenditures', { params: cleanParams });
};

export const createExpenditure = (data) => axiosInstance.post('/expenditures', data);
