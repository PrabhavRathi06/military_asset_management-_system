// =============================================
// pages/AssignmentsPage.jsx
// Assignments & Expenditures Module (Combined Page)
//
// Two tabs on this page:
//   Tab 1: Assignments  — Issue assets to personnel/units
//   Tab 2: Expenditures — Record assets used/damaged/destroyed
//
// RBAC:
//   - Admin: full access, can pick any base
//   - BaseCommander: can only work with their own base
//   - LogisticsOfficer: NO access (blocked at route level + App.jsx)
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Users, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAssignments, createAssignment } from '../api/assignments';
import { fetchExpenditures, createExpenditure } from '../api/expenditures';
import { fetchBases, fetchAssets } from '../api/admin';
import toast from 'react-hot-toast';

// Helper: format date
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';

// =============================================
// Sub-component: AssignmentsTab
// =============================================
const AssignmentsTab = ({ user, bases, assets }) => {
  const userBaseId = user?.baseId?._id || user?.baseId || '';

  const [assignments, setAssignments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    baseId: user?.role !== 'Admin' ? userBaseId : '',
    quantity: '',
    assignedTo: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.role !== 'Admin' ? userBaseId : '',
    assetType: '',
  });

  const assetTypes = ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'];

  const loadAssignments = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetchAssignments(filters);
      setAssignments(res.data.assignments || []);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.assetId || !formData.baseId || !formData.quantity || !formData.assignedTo) {
      setFormError('All required fields must be filled');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }
    setFormLoading(true);
    try {
      await createAssignment({ ...formData, quantity: Number(formData.quantity) });
      toast.success('Assignment recorded successfully!');
      setFormData({
        assetId: '',
        baseId: user?.role !== 'Admin' ? userBaseId : '',
        quantity: '',
        assignedTo: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      setShowForm(false);
      loadAssignments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create assignment';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const typeBadge = { Weapon: 'badge-danger', Vehicle: 'badge-info', Ammunition: 'badge-warning', Equipment: 'badge-neutral', Other: 'badge-neutral' };

  return (
    <div>
      {/* Header with New button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
          Issue assets to personnel or military units
        </p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          <Plus size={16} />{showForm ? 'Hide Form' : 'New Assignment'}
        </button>
      </div>

      {/* ---- Create Form ---- */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Record Assignment</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--color-text-muted)" />
            </button>
          </div>
          {formError && <div className="alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Asset *</label>
                <select className="form-input" value={formData.assetId} onChange={(e) => handleFormChange('assetId', e.target.value)} required>
                  <option value="">Select asset...</option>
                  {assets.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Base *</label>
                {user?.role === 'Admin' ? (
                  <select className="form-input" value={formData.baseId} onChange={(e) => handleFormChange('baseId', e.target.value)} required>
                    <option value="">Select base...</option>
                    {bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                ) : (
                  <input className="form-input" value={user?.baseId?.name || 'Your Base'} disabled style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input type="number" className="form-input" placeholder="e.g. 10" value={formData.quantity} onChange={(e) => handleFormChange('quantity', e.target.value)} min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned To *</label>
                <input type="text" className="form-input" placeholder="e.g. Alpha Company / Sgt. Sharma" value={formData.assignedTo} onChange={(e) => handleFormChange('assignedTo', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={formData.assignmentDate} onChange={(e) => handleFormChange('assignmentDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input type="text" className="form-input" placeholder="Optional notes" value={formData.remarks} onChange={(e) => handleFormChange('remarks', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : <Plus size={16} />}
                {formLoading ? 'Saving...' : 'Record Assignment'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Filters ---- */}
      <div className="filter-bar">
        <div><label className="form-label">From Date</label>
          <input type="date" className="form-input" value={filters.startDate} onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))} style={{ width: 145 }} />
        </div>
        <div><label className="form-label">To Date</label>
          <input type="date" className="form-input" value={filters.endDate} onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))} style={{ width: 145 }} />
        </div>
        {user?.role === 'Admin' && (
          <div><label className="form-label">Base</label>
            <select className="form-input" value={filters.baseId} onChange={(e) => setFilters(p => ({ ...p, baseId: e.target.value }))} style={{ width: 145 }}>
              <option value="">All Bases</option>
              {bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div><label className="form-label">Equipment Type</label>
          <select className="form-input" value={filters.assetType} onChange={(e) => setFilters(p => ({ ...p, assetType: e.target.value }))} style={{ width: 145 }}>
            <option value="">All Types</option>
            {assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={() => setFilters({ startDate: '', endDate: '', baseId: user?.role !== 'Admin' ? userBaseId : '', assetType: '' })} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Reset</button>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>Assignment Records</h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{assignments.length} records</span>
        </div>
        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="empty-state"><p>No assignments found.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Asset</th><th>Type</th><th>Base</th>
                  <th>Qty</th><th>Assigned To</th><th>Date</th>
                  <th>By</th><th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, idx) => (
                  <tr key={a._id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                    <td><strong>{a.assetId?.name || '-'}</strong><div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>per {a.assetId?.unit}</div></td>
                    <td><span className={`badge ${typeBadge[a.assetId?.type] || 'badge-neutral'}`}>{a.assetId?.type}</span></td>
                    <td>{a.baseId?.name || '-'}</td>
                    <td><strong style={{ color: 'var(--color-warning)', fontSize: '1rem' }}>{a.quantity.toLocaleString()}</strong></td>
                    <td><strong>{a.assignedTo}</strong></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(a.assignmentDate)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{a.assignedBy?.name || '-'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{a.remarks || '—'}</td>
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

// =============================================
// Sub-component: ExpendituresTab
// =============================================
const ExpendituresTab = ({ user, bases, assets }) => {
  const userBaseId = user?.baseId?._id || user?.baseId || '';

  const [expenditures, setExpenditures] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    baseId: user?.role !== 'Admin' ? userBaseId : '',
    quantity: '',
    reason: '',
    expenditureDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.role !== 'Admin' ? userBaseId : '',
    assetType: '',
  });

  const reasons = ['Used', 'Damaged', 'Destroyed', 'Expired', 'Lost'];
  const assetTypes = ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'];

  const loadExpenditures = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetchExpenditures(filters);
      setExpenditures(res.data.expenditures || []);
    } catch {
      toast.error('Failed to load expenditures');
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadExpenditures(); }, [loadExpenditures]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.assetId || !formData.baseId || !formData.quantity || !formData.reason) {
      setFormError('Asset, base, quantity, and reason are required');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }
    setFormLoading(true);
    try {
      await createExpenditure({ ...formData, quantity: Number(formData.quantity) });
      toast.success('Expenditure recorded successfully!');
      setFormData({
        assetId: '',
        baseId: user?.role !== 'Admin' ? userBaseId : '',
        quantity: '',
        reason: '',
        expenditureDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      setShowForm(false);
      loadExpenditures();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record expenditure';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Reason badge colors
  const reasonBadge = { Used: 'badge-info', Damaged: 'badge-warning', Destroyed: 'badge-danger', Expired: 'badge-neutral', Lost: 'badge-danger' };
  const typeBadge = { Weapon: 'badge-danger', Vehicle: 'badge-info', Ammunition: 'badge-warning', Equipment: 'badge-neutral', Other: 'badge-neutral' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
          Track assets that have been used, damaged, destroyed, expired, or lost
        </p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          <Plus size={16} />{showForm ? 'Hide Form' : 'Record Expenditure'}
        </button>
      </div>

      {/* ---- Create Form ---- */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Record Expenditure</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--color-text-muted)" />
            </button>
          </div>
          {formError && <div className="alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Asset *</label>
                <select className="form-input" value={formData.assetId} onChange={(e) => handleFormChange('assetId', e.target.value)} required>
                  <option value="">Select asset...</option>
                  {assets.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Base *</label>
                {user?.role === 'Admin' ? (
                  <select className="form-input" value={formData.baseId} onChange={(e) => handleFormChange('baseId', e.target.value)} required>
                    <option value="">Select base...</option>
                    {bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                ) : (
                  <input className="form-input" value={user?.baseId?.name || 'Your Base'} disabled style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input type="number" className="form-input" placeholder="e.g. 500" value={formData.quantity} onChange={(e) => handleFormChange('quantity', e.target.value)} min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <select className="form-input" value={formData.reason} onChange={(e) => handleFormChange('reason', e.target.value)} required>
                  <option value="">Select reason...</option>
                  {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={formData.expenditureDate} onChange={(e) => handleFormChange('expenditureDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input type="text" className="form-input" placeholder="Optional notes" value={formData.remarks} onChange={(e) => handleFormChange('remarks', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : <Flame size={16} />}
                {formLoading ? 'Saving...' : 'Record Expenditure'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Filters ---- */}
      <div className="filter-bar">
        <div><label className="form-label">From Date</label>
          <input type="date" className="form-input" value={filters.startDate} onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))} style={{ width: 145 }} />
        </div>
        <div><label className="form-label">To Date</label>
          <input type="date" className="form-input" value={filters.endDate} onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))} style={{ width: 145 }} />
        </div>
        {user?.role === 'Admin' && (
          <div><label className="form-label">Base</label>
            <select className="form-input" value={filters.baseId} onChange={(e) => setFilters(p => ({ ...p, baseId: e.target.value }))} style={{ width: 145 }}>
              <option value="">All Bases</option>
              {bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div><label className="form-label">Equipment Type</label>
          <select className="form-input" value={filters.assetType} onChange={(e) => setFilters(p => ({ ...p, assetType: e.target.value }))} style={{ width: 145 }}>
            <option value="">All Types</option>
            {assetTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={() => setFilters({ startDate: '', endDate: '', baseId: user?.role !== 'Admin' ? userBaseId : '', assetType: '' })} className="btn-secondary" style={{ fontSize: '0.8rem' }}>Reset</button>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>Expenditure Records</h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{expenditures.length} records</span>
        </div>
        {listLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div>
          </div>
        ) : expenditures.length === 0 ? (
          <div className="empty-state"><p>No expenditure records found.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Asset</th><th>Type</th><th>Base</th>
                  <th>Qty</th><th>Reason</th><th>Date</th>
                  <th>By</th><th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.map((e, idx) => (
                  <tr key={e._id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                    <td><strong>{e.assetId?.name || '-'}</strong><div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>per {e.assetId?.unit}</div></td>
                    <td><span className={`badge ${typeBadge[e.assetId?.type] || 'badge-neutral'}`}>{e.assetId?.type}</span></td>
                    <td>{e.baseId?.name || '-'}</td>
                    <td><strong style={{ color: 'var(--color-danger)', fontSize: '1rem' }}>-{e.quantity.toLocaleString()}</strong></td>
                    <td><span className={`badge ${reasonBadge[e.reason] || 'badge-neutral'}`}>{e.reason}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(e.expenditureDate)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{e.expendedBy?.name || '-'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{e.remarks || '—'}</td>
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

// =============================================
// Main AssignmentsPage (combines both tabs)
// =============================================
const AssignmentsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [bases, setBases] = useState([]);
  const [assets, setAssets] = useState([]);

  // Load shared data once for both tabs
  useEffect(() => {
    fetchBases().then((r) => setBases(r.data.bases || [])).catch(() => {});
    fetchAssets().then((r) => setAssets(r.data.assets || [])).catch(() => {});
  }, []);

  const tabBtn = (tab, label, icon) => ({
    padding: '0.6rem 1.5rem',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: activeTab === tab ? '600' : '400',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.15s',
  });

  return (
    <div>
      {/* ===== PAGE HEADER ===== */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>
            Assignments & Expenditures
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Issue assets to personnel and track consumed/damaged assets
          </p>
        </div>
      </div>

      {/* ===== TAB SWITCHER ===== */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        background: 'white',
        borderRadius: '8px 8px 0 0',
        padding: '0 0.5rem',
      }}>
        <button style={tabBtn('assignments')} onClick={() => setActiveTab('assignments')}>
          <Users size={16} /> Assignments
        </button>
        <button style={tabBtn('expenditures')} onClick={() => setActiveTab('expenditures')}>
          <Flame size={16} /> Expenditures
        </button>
      </div>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === 'assignments' ? (
        <AssignmentsTab user={user} bases={bases} assets={assets} />
      ) : (
        <ExpendituresTab user={user} bases={bases} assets={assets} />
      )}
    </div>
  );
};

export default AssignmentsPage;
