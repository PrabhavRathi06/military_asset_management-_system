// =============================================
// components/Layout.jsx
// Main App Layout with Sidebar + Content Area
//
// This wraps every page after login.
// It shows:
//   - Sidebar with navigation links (role-based)
//   - Top bar with user info + logout button
//   - Main content area where pages render
// =============================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout click
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // -----------------------------------------------
  // Navigation items - each has:
  //   path: URL to navigate to
  //   label: Text shown in sidebar
  //   icon: Lucide icon component
  //   roles: Which roles can SEE this link (undefined = all roles)
  // -----------------------------------------------
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: '/purchases',
      label: 'Purchases',
      icon: <ShoppingCart size={18} />,
    },
    {
      path: '/transfers',
      label: 'Transfers',
      icon: <ArrowLeftRight size={18} />,
    },
    {
      path: '/assignments',
      label: 'Assignments & Expenditures',
      icon: <Users size={18} />,
      // LogisticsOfficer cannot access this page
      roles: ['Admin', 'BaseCommander'],
    },
    {
      path: '/audit-logs',
      label: 'Audit Logs',
      icon: <FileText size={18} />,
      // Only Admin can see audit logs
      roles: ['Admin'],
    },
    {
      path: '/admin',
      label: 'Admin Panel',
      icon: <Settings size={18} />,
      // Only Admin can see admin panel
      roles: ['Admin'],
    },
  ];

  // Filter nav items based on user's role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true; // No role restriction → visible to all
    return item.roles.includes(user?.role);
  });

  // Role badge color
  const roleBadgeColor = {
    Admin: 'badge-danger',
    BaseCommander: 'badge-info',
    LogisticsOfficer: 'badge-warning',
  };

  return (
    <div className="app-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        {/* Logo / App Name */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={22} color="#c8a84b" />
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem', lineHeight: 1.2 }}>
                MilAsset
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                Management System
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'
              }
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
                       textDecoration: 'none', padding: '0.75rem 1.25rem',
                       color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem',
                       fontWeight: '500', transition: 'all 0.15s' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info at bottom of sidebar */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
              {user?.name}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
              {user?.baseId?.name || 'All Bases'}
            </div>
          </div>
          <span className={`badge ${roleBadgeColor[user?.role]}`} style={{ fontSize: '0.7rem' }}>
            {user?.role}
          </span>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Bar */}
        <header className="topbar">
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1rem' }}>
              Military Asset Management System
            </h3>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
