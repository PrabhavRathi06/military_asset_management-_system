// =============================================
// pages/AdminPage.jsx
// Admin Panel - Admin Only
//
// Three tabs:
//   Tab 1: Users     — view all users, create new user, delete user
//   Tab 2: Bases     — view all bases, add new base, delete base
//   Tab 3: Assets    — view all asset types, add new type, delete type
//
// All write operations are Admin-only (enforced on backend too)
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Shield, Building, Package } from 'lucide-react';
import {
  fetchUsers, fetchBases, fetchAssets,
  createUser, createBase, createAsset,
  deleteUser, deleteBase, deleteAsset,
} from '../api/admin';
import toast from 'react-hot-toast';

// =============================================
// Sub-component: UsersTab
// =============================================
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [bases, setBases] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: '', baseId: '',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      setUsers(res.data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    fetchBases().then((r) => setBases(r.data.bases || [])).catch(() => {});
  }, [loadUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setFormError('All fields are required');
      return;
    }
    if (formData.role !== 'Admin' && !formData.baseId) {
      setFormError('Base is required for non-Admin roles');
      return;
    }
    setFormLoading(true);
    try {
      await createUser(formData);
      toast.success('User created successfully!');
      setFormData({ name: '', email: '', password: '', role: '', baseId: '' });
      setShowForm(false);
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  // Role badge styles
  const roleBadge = { Admin: 'badge-danger', BaseCommander: 'badge-info', LogisticsOfficer: 'badge-warning' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
          Manage system users and their roles
        </p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          <Plus size={16} />{showForm ? 'Hide Form' : 'Add User'}
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Create New User</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="var(--color-text-muted)" />
            </button>
          </div>
          {formError && <div className="alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Col. Raj Singh" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" placeholder="user@military.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-input" value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value, baseId: '' }))} required>
                  <option value="">Select role...</option>
                  <option value="Admin">Admin</option>
                  <option value="BaseCommander">Base Commander</option>
                  <option value="LogisticsOfficer">Logistics Officer</option>
                </select>
              </div>
              {formData.role && formData.role !== 'Admin' && (
                <div className="form-group">
                  <label className="form-label">Assigned Base *</label>
                  <select className="form-input" value={formData.baseId} onChange={(e) => setFormData(p => ({ ...p, baseId: e.target.value }))} required>
                    <option value="">Select base...</option>
                    {bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : <Plus size={16} />}
                {formLoading ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>All Users</h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{users.length} users</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Assigned Base</th><th>Created</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u._id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td><span className={`badge ${roleBadge[u.role] || 'badge-neutral'}`}>{u.role}</span></td>
                    <td>{u.baseId?.name || <span style={{ color: 'var(--color-text-muted)' }}>All Bases</span>}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '0.25rem' }}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
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

// =============================================
// Sub-component: BasesTab
// =============================================
const BasesTab = () => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ name: '', location: '' });

  const loadBases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBases();
      setBases(res.data.bases || []);
    } catch {
      toast.error('Failed to load bases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBases(); }, [loadBases]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.location) {
      setFormError('Name and location are required');
      return;
    }
    setFormLoading(true);
    try {
      await createBase(formData);
      toast.success('Base created successfully!');
      setFormData({ name: '', location: '' });
      setShowForm(false);
      loadBases();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create base';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete base "${name}"? This cannot be undone.`)) return;
    try {
      await deleteBase(id);
      toast.success('Base deleted');
      loadBases();
    } catch {
      toast.error('Failed to delete base');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>Manage army bases in the system</p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          <Plus size={16} />{showForm ? 'Hide Form' : 'Add Base'}
        </button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Add New Base</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--color-text-muted)" /></button>
          </div>
          {formError && <div className="alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Base Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Delta Base" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input type="text" className="form-input" placeholder="e.g. Jammu, India" value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : <Plus size={16} />}
                {formLoading ? 'Creating...' : 'Create Base'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>All Bases</h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{bases.length} bases</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Base Name</th><th>Location</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {bases.map((b, idx) => (
                <tr key={b._id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td><strong>{b.name}</strong></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{b.location}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button onClick={() => handleDelete(b._id, b.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '0.25rem' }} title="Delete base">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// =============================================
// Sub-component: AssetsTab (equipment types)
// =============================================
const AssetsTab = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ name: '', type: '', unit: '', description: '' });

  const types = ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'];

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAssets();
      setAssets(res.data.assets || []);
    } catch {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.type || !formData.unit) {
      setFormError('Name, type, and unit are required');
      return;
    }
    setFormLoading(true);
    try {
      await createAsset(formData);
      toast.success('Asset type created!');
      setFormData({ name: '', type: '', unit: '', description: '' });
      setShowForm(false);
      loadAssets();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create asset';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete asset type "${name}"?`)) return;
    try {
      await deleteAsset(id);
      toast.success('Asset type deleted');
      loadAssets();
    } catch {
      toast.error('Failed to delete asset type');
    }
  };

  const typeBadge = { Weapon: 'badge-danger', Vehicle: 'badge-info', Ammunition: 'badge-warning', Equipment: 'badge-neutral', Other: 'badge-neutral' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>Manage equipment / asset types in the system</p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          <Plus size={16} />{showForm ? 'Hide Form' : 'Add Asset Type'}
        </button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Add New Asset Type</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color="var(--color-text-muted)" /></button>
          </div>
          {formError && <div className="alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input type="text" className="form-input" placeholder="e.g. M16 Rifle" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-input" value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} required>
                  <option value="">Select type...</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <input type="text" className="form-input" placeholder="e.g. Piece, Round, Vehicle" value={formData.unit} onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-input" placeholder="Optional description" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : <Plus size={16} />}
                {formLoading ? 'Creating...' : 'Create Asset Type'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>All Asset Types</h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{assets.length} types</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }}></div></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Name</th><th>Type</th><th>Unit</th><th>Description</th><th>Action</th></tr></thead>
            <tbody>
              {assets.map((a, idx) => (
                <tr key={a._id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                  <td><strong>{a.name}</strong></td>
                  <td><span className={`badge ${typeBadge[a.type] || 'badge-neutral'}`}>{a.type}</span></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{a.unit}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{a.description || '—'}</td>
                  <td>
                    <button onClick={() => handleDelete(a._id, a.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '0.25rem' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// =============================================
// Main Admin Page (combines 3 tabs)
// =============================================
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabBtn = (tab) => ({
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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>Admin Panel</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage users, bases, and equipment types
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        background: 'white',
        borderRadius: '8px 8px 0 0',
        padding: '0 0.5rem',
      }}>
        <button style={tabBtn('users')} onClick={() => setActiveTab('users')}>
          <Shield size={16} /> Users
        </button>
        <button style={tabBtn('bases')} onClick={() => setActiveTab('bases')}>
          <Building size={16} /> Bases
        </button>
        <button style={tabBtn('assets')} onClick={() => setActiveTab('assets')}>
          <Package size={16} /> Asset Types
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'bases' && <BasesTab />}
      {activeTab === 'assets' && <AssetsTab />}
    </div>
  );
};

export default AdminPage;
