// =============================================
// pages/PurchasesPage.jsx
// Purchases Module
//
// Two sections:
//   1. Create Purchase Form (top card)
//   2. Purchase History Table (with filters)
//
// RBAC:
//   - All 3 roles can view and create purchases
//   - BaseCommander / LogisticsOfficer: forced to their own base
//   - Admin: can select any base
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPurchases, createPurchase } from '../api/purchases';
import { fetchBases, fetchAssets } from '../api/admin';
import toast from 'react-hot-toast';

// =============================================
// Helper: Format a date string nicely
// =============================================
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

// =============================================
// Main Purchases Page
// =============================================
const PurchasesPage = () => {
  const { user } = useAuth();

  // ---- Dropdown data ----
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);

  // ---- Purchase history list ----
  const [purchases, setPurchases] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // ---- Create form state ----
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    baseId: user?.role !== 'Admin' ? user?.baseId?._id || '' : '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0], // Today
    supplier: '',
    remarks: '',
  });
  const [formError, setFormError] = useState('');

  // ---- Filter state ----
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.role !== 'Admin' ? user?.baseId?._id || '' : '',
    assetType: '',
  });

  // Asset types for filter dropdown
  const assetTypes = ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'];

  // -----------------------------------------------
  // Load dropdown data on mount
  // -----------------------------------------------
  useEffect(() => {
    fetchAssets()
      .then((res) => setAssets(res.data.assets || []))
      .catch(() => toast.error('Failed to load asset types'));

    if (user?.role === 'Admin') {
      fetchBases()
        .then((res) => setBases(res.data.bases || []))
        .catch(() => toast.error('Failed to load bases'));
    }
  }, [user]);

  // -----------------------------------------------
  // Load purchase history (re-runs when filters change)
  // -----------------------------------------------
  const loadPurchases = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetchPurchases(filters);
      setPurchases(res.data.purchases || []);
    } catch {
      toast.error('Failed to load purchase history');
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // -----------------------------------------------
  // Handle form field changes
  // -----------------------------------------------
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  // -----------------------------------------------
  // Handle form submission → create purchase
  // -----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.assetId || !formData.baseId || !formData.quantity) {
      setFormError('Asset, Base, and Quantity are required');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }

    setFormLoading(true);
    try {
      await createPurchase({
        ...formData,
        quantity: Number(formData.quantity),
      });

      toast.success('Purchase recorded successfully!');

      // Reset form
      setFormData({
        assetId: '',
        baseId: user?.role !== 'Admin' ? user?.baseId?._id || '' : '',
        quantity: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        remarks: '',
      });
      setShowForm(false);

      // Refresh the list
      loadPurchases();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create purchase';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // -----------------------------------------------
  // Handle filter changes
  // -----------------------------------------------
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      baseId: user?.role !== 'Admin' ? user?.baseId?._id || '' : '',
      assetType: '',
    });
  };

  // Badge color based on asset type
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
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>Purchases</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Record and track asset purchases
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(!showForm); setFormError(''); }}
        >
          <Plus size={16} />
          {showForm ? 'Hide Form' : 'New Purchase'}
        </button>
      </div>

      {/* ===== CREATE PURCHASE FORM ===== */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Record New Purchase</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--color-text-muted)" />
            </button>
          </div>

          {formError && <div className="alert-error">{formError}</div>}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Asset + Base + Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

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

              {/* Base Dropdown (Admin picks; others see their base) */}
              <div className="form-group">
                <label className="form-label">Base *</label>
                {user?.role === 'Admin' ? (
                  <select
                    className="form-input"
                    value={formData.baseId}
                    onChange={(e) => handleFormChange('baseId', e.target.value)}
                    required
                  >
                    <option value="">Select base...</option>
                    {bases.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-input"
                    value={user?.baseId?.name || 'Your Base'}
                    disabled
                    style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
                  />
                )}
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Row 2: Date + Supplier + Remarks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

              {/* Purchase Date */}
              <div className="form-group">
                <label className="form-label">Purchase Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.purchaseDate}
                  onChange={(e) => handleFormChange('purchaseDate', e.target.value)}
                  required
                />
              </div>

              {/* Supplier */}
              <div className="form-group">
                <label className="form-label">Supplier (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Defence Ministry"
                  value={formData.supplier}
                  onChange={(e) => handleFormChange('supplier', e.target.value)}
                />
              </div>

              {/* Remarks */}
              <div className="form-group">
                <label className="form-label">Remarks (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Any additional notes"
                  value={formData.remarks}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : <Plus size={16} />}
                {formLoading ? 'Saving...' : 'Record Purchase'}
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
            <label className="form-label">Base</label>
            <select
              className="form-input"
              value={filters.baseId}
              onChange={(e) => handleFilterChange('baseId', e.target.value)}
              style={{ width: 150 }}
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

      {/* ===== PURCHASE HISTORY TABLE ===== */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>
            Purchase History
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
            {purchases.length} record{purchases.length !== 1 ? 's' : ''}
          </span>
        </div>

        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div>
            <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Loading purchases...
            </p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <p>No purchases found for the selected filters.</p>
            <button
              className="btn-primary"
              style={{ marginTop: '1rem', fontSize: '0.85rem' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={15} /> Record First Purchase
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Base</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Recorded By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, idx) => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                    <td>
                      <strong>{p.assetId?.name || '-'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        per {p.assetId?.unit}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${typeBadge[p.assetId?.type] || 'badge-neutral'}`}>
                        {p.assetId?.type || '-'}
                      </span>
                    </td>
                    <td>{p.baseId?.name || '-'}</td>
                    <td>
                      <strong style={{ color: 'var(--color-success)', fontSize: '1rem' }}>
                        +{p.quantity.toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.purchaseDate)}</td>
                    <td>{p.supplier || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                    <td style={{ fontSize: '0.8rem' }}>{p.addedBy?.name || '-'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', maxWidth: 160 }}>
                      {p.remarks || '—'}
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

export default PurchasesPage;
