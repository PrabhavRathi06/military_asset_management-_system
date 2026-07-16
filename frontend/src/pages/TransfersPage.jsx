// =============================================
// pages/TransfersPage.jsx
// Transfers Module
//
// Two sections:
//   1. Create Transfer Form  - pick asset, from-base, to-base, quantity
//   2. Transfer History Table - shows all transfers with direction badge
//
// RBAC:
//   - All 3 roles can view and create transfers
//   - BaseCommander / LogisticsOfficer: "From Base" is locked to their own base
//   - Admin: can pick any from/to base combination
//
// Key logic on create:
//   - Backend validates source has enough stock
//   - Shows clear error if stock insufficient
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTransfers, createTransfer } from '../api/transfers';
import { fetchBases, fetchAssets } from '../api/admin';
import toast from 'react-hot-toast';

// Helper: format date nicely
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

// =============================================
// Main Transfers Page
// =============================================
const TransfersPage = () => {
  const { user } = useAuth();

  // ---- Dropdown data ----
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);

  // ---- Transfer history list ----
  const [transfers, setTransfers] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // ---- Create form state ----
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Determine the user's base ID for locking the "From Base" field
  const userBaseId = user?.baseId?._id || user?.baseId || '';

  const [formData, setFormData] = useState({
    assetId: '',
    // Non-Admin: From base is always their own base
    fromBaseId: user?.role !== 'Admin' ? userBaseId : '',
    toBaseId: '',
    quantity: '',
    transferDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });
  const [formError, setFormError] = useState('');

  // ---- Filter state ----
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.role !== 'Admin' ? userBaseId : '',
    assetType: '',
  });

  const assetTypes = ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'];

  // -----------------------------------------------
  // Load bases and assets on mount
  // -----------------------------------------------
  useEffect(() => {
    fetchBases()
      .then((res) => setBases(res.data.bases || []))
      .catch(() => toast.error('Failed to load bases'));

    fetchAssets()
      .then((res) => setAssets(res.data.assets || []))
      .catch(() => toast.error('Failed to load asset types'));
  }, []);

  // -----------------------------------------------
  // Load transfer history (re-runs when filters change)
  // -----------------------------------------------
  const loadTransfers = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetchTransfers(filters);
      setTransfers(res.data.transfers || []);
    } catch {
      toast.error('Failed to load transfer history');
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  // -----------------------------------------------
  // Handle form field changes
  // -----------------------------------------------
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  // -----------------------------------------------
  // Handle form submission → create transfer
  // -----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation
    if (!formData.assetId || !formData.fromBaseId || !formData.toBaseId || !formData.quantity) {
      setFormError('Asset, From Base, To Base, and Quantity are required');
      return;
    }
    if (formData.fromBaseId === formData.toBaseId) {
      setFormError('Source and destination base cannot be the same');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }

    setFormLoading(true);
    try {
      const res = await createTransfer({
        ...formData,
        quantity: Number(formData.quantity),
      });

      toast.success(res.data.message || 'Transfer completed successfully!');

      // Reset form
      setFormData({
        assetId: '',
        fromBaseId: user?.role !== 'Admin' ? userBaseId : '',
        toBaseId: '',
        quantity: '',
        transferDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      setShowForm(false);
      loadTransfers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Transfer failed. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // -----------------------------------------------
  // Filter helpers
  // -----------------------------------------------
  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const resetFilters = () =>
    setFilters({
      startDate: '',
      endDate: '',
      baseId: user?.role !== 'Admin' ? userBaseId : '',
      assetType: '',
    });

  // -----------------------------------------------
  // Determine direction badge for current user
  // If user's base is the "from" base → Outgoing (red)
  // If user's base is the "to" base   → Incoming (green)
  // Admin: shows both directions neutrally
  // -----------------------------------------------
  const getDirectionBadge = (transfer) => {
    if (user?.role === 'Admin') {
      return <span className="badge badge-neutral">Transfer</span>;
    }
    const myBase = userBaseId?.toString();
    const from = transfer.fromBaseId?._id?.toString();
    const to = transfer.toBaseId?._id?.toString();

    if (from === myBase) {
      return <span className="badge badge-danger">Outgoing</span>;
    } else if (to === myBase) {
      return <span className="badge badge-success">Incoming</span>;
    }
    return <span className="badge badge-neutral">Transfer</span>;
  };

  // Asset type badge colors
  const typeBadge = {
    Weapon: 'badge-danger',
    Vehicle: 'badge-info',
    Ammunition: 'badge-warning',
    Equipment: 'badge-neutral',
    Other: 'badge-neutral',
  };

  return (
    <div>
      {/* ===== PAGE HEADER ===== */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>Transfers</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Transfer assets between military bases
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(!showForm); setFormError(''); }}
        >
          <Plus size={16} />
          {showForm ? 'Hide Form' : 'New Transfer'}
        </button>
      </div>

      {/* ===== CREATE TRANSFER FORM ===== */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Initiate Asset Transfer</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--color-text-muted)" />
            </button>
          </div>

          {formError && <div className="alert-error">{formError}</div>}

          {/* Info note about stock validation */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 6,
            padding: '0.6rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8rem',
            color: '#1e40af',
          }}>
            ℹ️ The system will automatically validate that the source base has sufficient stock before completing the transfer.
          </div>

          <form onSubmit={handleSubmit}>
            {/* Row 1: Asset + From Base + To Base + Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>

              {/* Asset Dropdown */}
              <div className="form-group">
                <label className="form-label">Asset / Equipment *</label>
                <select
                  className="form-input"
                  value={formData.assetId}
                  onChange={(e) => handleFormChange('assetId', e.target.value)}
                  required
                >
                  <option value="">Select asset...</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* From Base */}
              <div className="form-group">
                <label className="form-label">From Base *</label>
                {user?.role === 'Admin' ? (
                  <select
                    className="form-input"
                    value={formData.fromBaseId}
                    onChange={(e) => handleFormChange('fromBaseId', e.target.value)}
                    required
                  >
                    <option value="">Select source base...</option>
                    {bases.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  // Non-admin: locked to their own base
                  <input
                    className="form-input"
                    value={user?.baseId?.name || 'Your Base'}
                    disabled
                    style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                  />
                )}
              </div>

              {/* To Base */}
              <div className="form-group">
                <label className="form-label">To Base *</label>
                <select
                  className="form-input"
                  value={formData.toBaseId}
                  onChange={(e) => handleFormChange('toBaseId', e.target.value)}
                  required
                >
                  <option value="">Select destination...</option>
                  {bases
                    .filter((b) => b._id !== formData.fromBaseId) // Exclude source base
                    .map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 20"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Row 2: Date + Remarks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Transfer Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.transferDate}
                  onChange={(e) => handleFormChange('transferDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Remarks (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Urgent deployment support"
                  value={formData.remarks}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading
                  ? <span className="spinner" style={{ width: 16, height: 16 }}></span>
                  : <ArrowRight size={16} />}
                {formLoading ? 'Processing...' : 'Initiate Transfer'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== FILTER BAR ===== */}
      <div className="filter-bar">
        <div>
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{ width: 150 }}
          />
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{ width: 150 }}
          />
        </div>
        {user?.role === 'Admin' && (
          <div>
            <label className="form-label">Base (From or To)</label>
            <select
              className="form-input"
              value={filters.baseId}
              onChange={(e) => handleFilterChange('baseId', e.target.value)}
              style={{ width: 160 }}
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="form-label">Equipment Type</label>
          <select
            className="form-input"
            value={filters.assetType}
            onChange={(e) => handleFilterChange('assetType', e.target.value)}
            style={{ width: 150 }}
          >
            <option value="">All Types</option>
            {assetTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={resetFilters} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            Reset
          </button>
        </div>
      </div>

      {/* ===== TRANSFER HISTORY TABLE ===== */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>
            Transfer History
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
            {transfers.length} record{transfers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div>
            <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Loading transfers...
            </p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="empty-state">
            <p>No transfers found for the selected filters.</p>
            <button
              className="btn-primary"
              style={{ marginTop: '1rem', fontSize: '0.85rem' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={15} /> Initiate First Transfer
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Direction</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>From Base</th>
                  <th></th>
                  <th>To Base</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Initiated By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, idx) => (
                  <tr key={t._id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                    <td>{getDirectionBadge(t)}</td>
                    <td>
                      <strong>{t.assetId?.name || '-'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        per {t.assetId?.unit}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${typeBadge[t.assetId?.type] || 'badge-neutral'}`}>
                        {t.assetId?.type || '-'}
                      </span>
                    </td>
                    <td>
                      <strong>{t.fromBaseId?.name || '-'}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {t.fromBaseId?.location}
                      </div>
                    </td>
                    {/* Arrow between bases */}
                    <td style={{ textAlign: 'center', padding: '0 0.25rem' }}>
                      <ArrowRight size={16} color="var(--color-text-muted)" />
                    </td>
                    <td>
                      <strong>{t.toBaseId?.name || '-'}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {t.toBaseId?.location}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-info)', fontSize: '1rem' }}>
                        {t.quantity.toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.transferDate)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{t.initiatedBy?.name || '-'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', maxWidth: 160 }}>
                      {t.remarks || '—'}
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

export default TransfersPage;
