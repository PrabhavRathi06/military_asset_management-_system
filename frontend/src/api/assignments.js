// =============================================
// api/assignments.js
// API call helpers for Assignments
// =============================================

import axiosInstance from './axiosInstance';

export const fetchAssignments = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return axiosInstance.get('/assignments', { params: cleanParams });
};

export const createAssignment = (data) => axiosInstance.post('/assignments', data);
