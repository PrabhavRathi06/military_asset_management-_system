// =============================================
// pages/AuditLogsPage.jsx
// Audit Logs Viewer - Admin Only
//
// Shows a complete history of every action taken
// in the system — who did what, when, and on which module.
//
// Filters: Module, Action Type, Date Range
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { fetchAuditLogs } from '../api/auditLogs';
import toast from 'react-hot-toast';

// Format timestamp as readable date + time
const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    startDate: '',
    endDate: '',
    limit: '100',
  });

  const modules = ['Purchase', 'Transfer', 'Assignment', 'Expenditure', 'User', 'Base', 'Asset', 'Auth'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'];

  // Load audit logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs(filters);
      setLogs(res.data.logs || []);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const resetFilters = () =>
    setFilters({ module: '', action: '', startDate: '', endDate: '', limit: '100' });

  // Color coding for action badges
  const actionBadge = {
    CREATE: 'badge-success',
    UPDATE: 'badge-info',
    DELETE: 'badge-danger',
    LOGIN: 'badge-neutral',
  };

  // Color coding for module badges
  const moduleBadge = {
    Purchase: 'badge-success',
    Transfer: 'badge-info',
    Assignment: 'badge-warning',
    Expenditure: 'badge-danger',
    User: 'badge-neutral',
    Base: 'badge-neutral',
    Asset: 'badge-neutral',
    Auth: 'badge-neutral',
  };

  return (
    <div>
      {/* ===== PAGE HEADER ===== */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>Audit Logs</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Complete activity trail — every action recorded for accountability
          </p>
        </div>
        <button onClick={loadLogs} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
          Refresh
        </button>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="filter-bar">
        <div>
          <label className="form-label">Module</label>
          <select
            className="form-input"
            value={filters.module}
            onChange={(e) => handleFilterChange('module', e.target.value)}
            style={{ width: 150 }}
          >
            <option value="">All Modules</option>
            {modules.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Action</label>
          <select
            className="form-input"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            style={{ width: 130 }}
          >
            <option value="">All Actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{ width: 145 }}
          />
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{ width: 145 }}
          />
        </div>
        <div>
          <label className="form-label">Show Last</label>
          <select
            className="form-input"
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            style={{ width: 110 }}
          >
            <option value="50">50 records</option>
            <option value="100">100 records</option>
            <option value="200">200 records</option>
            <option value="500">500 records</option>
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={resetFilters} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            Reset
          </button>
        </div>
      </div>

      {/* ===== LOGS TABLE ===== */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Activity Log
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
            {logs.length} entries
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div>
            <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Loading audit logs...
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <p>No audit logs found for the selected filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={log._id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {idx + 1}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.875rem' }}>{log.userId?.name || 'System'}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {log.userId?.email || ''}
                      </div>
                    </td>
                    <td>
                      {log.userId?.role && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {log.userId.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${actionBadge[log.action] || 'badge-neutral'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${moduleBadge[log.module] || 'badge-neutral'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: 320 }}>
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
