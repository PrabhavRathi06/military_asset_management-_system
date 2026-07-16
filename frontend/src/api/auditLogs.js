// =============================================
// api/auditLogs.js
// API call helper for Audit Logs
// =============================================

import axiosInstance from './axiosInstance';

// Get audit logs with optional filters
// params: { module, action, startDate, endDate, limit }
export const fetchAuditLogs = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return axiosInstance.get('/audit-logs', { params: cleanParams });
};
