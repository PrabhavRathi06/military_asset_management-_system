// =============================================
// pages/DashboardPage.jsx
// Main Dashboard - shows 5 key metric cards:
//   1. Opening Balance
//   2. Closing Balance
//   3. Net Movement (clickable → popup)
//   4. Assigned
//   5. Expended
//
// Filters: Date Range, Base, Equipment Type
// Bonus: Net Movement popup shows Purchases/TransferIn/TransferOut details
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, Package, Users, Flame, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardStats } from '../api/dashboard';
import { fetchBases } from '../api/admin';
import toast from 'react-hot-toast';

// =============================================
// Sub-component: MetricCard
// Displays a single KPI metric
// =============================================
const MetricCard = ({ label, value, icon, color, onClick, clickable }) => (
  <div
    className="metric-card"
    onClick={onClick}
    style={{
      cursor: clickable ? 'pointer' : 'default',
      borderTop: `3px solid ${color}`,
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={(e) => { if (clickable) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)'; }}
    onMouseLeave={(e) => { if (clickable) e.currentTarget.style.boxShadow = ''; }}
    title={clickable ? 'Click to see breakdown' : ''}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-value" style={{ color }}>{value.toLocaleString()}</div>
        {clickable && (
          <div className="metric-sub" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Click to view breakdown ↗
          </div>
        )}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </div>
);

// =============================================
// Sub-component: NetMovementModal (Bonus Feature)
// Popup showing Purchases, Transfer In, Transfer Out detail tables
// =============================================
const NetMovementModal = ({ isOpen, onClose, details, stats }) => {
  const [activeTab, setActiveTab] = useState('purchases');

  if (!isOpen) return null;

  const tabStyle = (tab) => ({
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
    transition: 'all 0.15s',
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Net Movement Breakdown</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Purchases <strong style={{ color: 'var(--color-success)' }}>+{stats.totalPurchases}</strong>
              {' '}· Transfer In <strong style={{ color: 'var(--color-info)' }}>+{stats.totalTransferIn}</strong>
              {' '}· Transfer Out <strong style={{ color: 'var(--color-danger)' }}>-{stats.totalTransferOut}</strong>
              {' '}= Net <strong style={{ color: 'var(--color-primary)' }}>{stats.netMovement}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="var(--color-text-muted)" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <button style={tabStyle('purchases')} onClick={() => setActiveTab('purchases')}>
            Purchases ({details.purchases?.length || 0})
          </button>
          <button style={tabStyle('transfersIn')} onClick={() => setActiveTab('transfersIn')}>
            Transfer In ({details.transfersIn?.length || 0})
          </button>
          <button style={tabStyle('transfersOut')} onClick={() => setActiveTab('transfersOut')}>
            Transfer Out ({details.transfersOut?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>

          {/* Purchases Table */}
          {activeTab === 'purchases' && (
            details.purchases?.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Base</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {details.purchases.map((p) => (
                    <tr key={p._id}>
                      <td>{p.assetId?.name || '-'}</td>
                      <td><span className="badge badge-info">{p.assetId?.type}</span></td>
                      <td>{p.baseId?.name || '-'}</td>
                      <td><strong>{p.quantity} {p.assetId?.unit}</strong></td>
                      <td>{formatDate(p.purchaseDate)}</td>
                      <td>{p.supplier || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><p>No purchases in this period</p></div>
          )}

          {/* Transfers In Table */}
          {activeTab === 'transfersIn' && (
            details.transfersIn?.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>From Base</th>
                    <th>To Base</th>
                    <th>Qty</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {details.transfersIn.map((t) => (
                    <tr key={t._id}>
                      <td>{t.assetId?.name || '-'}</td>
                      <td><span className="badge badge-info">{t.assetId?.type}</span></td>
                      <td>{t.fromBaseId?.name || '-'}</td>
                      <td>{t.toBaseId?.name || '-'}</td>
                      <td><strong style={{ color: 'var(--color-success)' }}>+{t.quantity}</strong></td>
                      <td>{formatDate(t.transferDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><p>No incoming transfers in this period</p></div>
          )}

          {/* Transfers Out Table */}
          {activeTab === 'transfersOut' && (
            details.transfersOut?.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>From Base</th>
                    <th>To Base</th>
                    <th>Qty</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {details.transfersOut.map((t) => (
                    <tr key={t._id}>
                      <td>{t.assetId?.name || '-'}</td>
                      <td><span className="badge badge-info">{t.assetId?.type}</span></td>
                      <td>{t.fromBaseId?.name || '-'}</td>
                      <td>{t.toBaseId?.name || '-'}</td>
                      <td><strong style={{ color: 'var(--color-danger)' }}>-{t.quantity}</strong></td>
                      <td>{formatDate(t.transferDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><p>No outgoing transfers in this period</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================
// Main Dashboard Page Component
// =============================================
const DashboardPage = () => {
  const { user } = useAuth();

  // Stats from the API
  const [stats, setStats] = useState({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: 0,
    totalPurchases: 0,
    totalTransferIn: 0,
    totalTransferOut: 0,
    totalAssigned: 0,
    totalExpended: 0,
  });

  // Detail data for the Net Movement popup
  const [details, setDetails] = useState({ purchases: [], transfersIn: [], transfersOut: [] });

  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    baseId: user?.role !== 'Admin' ? user?.baseId?._id || '' : '',
    assetType: '',
  });

  // Bases list for the dropdown (Admin only)
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Net Movement popup

  // -----------------------------------------------
  // Load bases for the base dropdown (Admin only)
  // -----------------------------------------------
  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchBases()
        .then((res) => setBases(res.data.bases || []))
        .catch(() => {});
    }
  }, [user]);

  // -----------------------------------------------
  // Load dashboard data whenever filters change
  // -----------------------------------------------
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDashboardStats(filters);
      setStats(res.data.stats);
      setDetails(res.data.details);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle filter field changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      baseId: user?.role !== 'Admin' ? user?.baseId?._id || '' : '',
      assetType: '',
    });
  };

  // Asset types for the dropdown
  const assetTypes = ['Weapon', 'Vehicle', 'Ammunition', 'Equipment', 'Other'];

  // -----------------------------------------------
  // Metric cards config
  // -----------------------------------------------
  const metricCards = [
    {
      label: 'Opening Balance',
      value: stats.openingBalance,
      icon: <Package size={20} color="#1a6fa6" />,
      color: '#1a6fa6',
      clickable: false,
    },
    {
      label: 'Closing Balance',
      value: stats.closingBalance,
      icon: stats.closingBalance >= stats.openingBalance
        ? <TrendingUp size={20} color="#2d7d46" />
        : <TrendingDown size={20} color="#c0392b" />,
      color: stats.closingBalance >= stats.openingBalance ? '#2d7d46' : '#c0392b',
      clickable: false,
    },
    {
      label: 'Net Movement',
      value: stats.netMovement,
      icon: <ArrowLeftRight size={20} color="#7c3aed" />,
      color: '#7c3aed',
      clickable: true, // Opens popup
      onClick: () => setShowModal(true),
    },
    {
      label: 'Assigned',
      value: stats.totalAssigned,
      icon: <Users size={20} color="#c27803" />,
      color: '#c27803',
      clickable: false,
    },
    {
      label: 'Expended',
      value: stats.totalExpended,
      icon: <Flame size={20} color="#c0392b" />,
      color: '#c0392b',
      clickable: false,
    },
  ];

  return (
    <div>
      {/* ===== PAGE HEADER ===== */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {user?.role === 'Admin'
              ? 'System-wide asset overview'
              : `Asset overview for ${user?.baseId?.name || 'your base'}`}
          </p>
        </div>
        <button onClick={loadStats} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
          Refresh
        </button>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="filter-bar">
        {/* Start Date */}
        <div>
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            style={{ width: 160 }}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-input"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            style={{ width: 160 }}
          />
        </div>

        {/* Base Filter (Admin only) */}
        {user?.role === 'Admin' && (
          <div>
            <label className="form-label">Base</label>
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

        {/* Equipment Type Filter */}
        <div>
          <label className="form-label">Equipment Type</label>
          <select
            className="form-input"
            value={filters.assetType}
            onChange={(e) => handleFilterChange('assetType', e.target.value)}
            style={{ width: 160 }}
          >
            <option value="">All Types</option>
            {assetTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={resetFilters} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* ===== METRIC CARDS GRID ===== */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading dashboard data...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {metricCards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
              color={card.color}
              clickable={card.clickable}
              onClick={card.onClick}
            />
          ))}
        </div>
      )}

      {/* ===== SUMMARY TABLE ===== */}
      {!loading && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontSize: '1rem' }}>
            Movement Summary
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Opening Balance</strong></td>
                <td style={{ color: 'var(--color-text-muted)' }}>Stock at start of period</td>
                <td style={{ textAlign: 'right' }}><strong>{stats.openingBalance.toLocaleString()}</strong></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--color-success)' }}>+ Purchases</td>
                <td style={{ color: 'var(--color-text-muted)' }}>New assets acquired</td>
                <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>+{stats.totalPurchases.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--color-info)' }}>+ Transfer In</td>
                <td style={{ color: 'var(--color-text-muted)' }}>Assets received from other bases</td>
                <td style={{ textAlign: 'right', color: 'var(--color-info)' }}>+{stats.totalTransferIn.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--color-danger)' }}>− Transfer Out</td>
                <td style={{ color: 'var(--color-text-muted)' }}>Assets sent to other bases</td>
                <td style={{ textAlign: 'right', color: 'var(--color-danger)' }}>-{stats.totalTransferOut.toLocaleString()}</td>
              </tr>
              <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                <td><strong style={{ color: '#7c3aed' }}>= Net Movement</strong></td>
                <td style={{ color: 'var(--color-text-muted)' }}>Purchases + In − Out</td>
                <td style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#7c3aed' }}>{stats.netMovement >= 0 ? '+' : ''}{stats.netMovement.toLocaleString()}</strong>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--color-warning)' }}>− Assigned</td>
                <td style={{ color: 'var(--color-text-muted)' }}>Issued to personnel / units</td>
                <td style={{ textAlign: 'right', color: 'var(--color-warning)' }}>-{stats.totalAssigned.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '1.5rem', color: 'var(--color-danger)' }}>− Expended</td>
                <td style={{ color: 'var(--color-text-muted)' }}>Used / damaged / destroyed</td>
                <td style={{ textAlign: 'right', color: 'var(--color-danger)' }}>-{stats.totalExpended.toLocaleString()}</td>
              </tr>
              <tr style={{ borderTop: '2px solid var(--color-primary)', background: 'rgba(30,58,95,0.04)' }}>
                <td><strong>= Closing Balance</strong></td>
                <td style={{ color: 'var(--color-text-muted)' }}>Stock at end of period</td>
                <td style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
                    {stats.closingBalance.toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Filter hint */}
          {(filters.startDate || filters.endDate || filters.assetType) && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              * Showing transactions filtered by: {filters.startDate && `from ${filters.startDate}`} {filters.endDate && `to ${filters.endDate}`} {filters.assetType && `· Type: ${filters.assetType}`}
            </p>
          )}
        </div>
      )}

      {/* ===== NET MOVEMENT POPUP (BONUS) ===== */}
      <NetMovementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        details={details}
        stats={stats}
      />
    </div>
  );
};

export default DashboardPage;
