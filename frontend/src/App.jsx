// =============================================
// App.jsx
// Root component — sets up all routing for the app
// All pages are now fully implemented (Parts 1–7)
// =============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout & Guards
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PurchasesPage from './pages/PurchasesPage';
import TransfersPage from './pages/TransfersPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// -----------------------------------------------
// Main App component
// -----------------------------------------------
function App() {
  return (
    <AuthProvider>
      {/* Toast notifications (top-right corner) */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '0.875rem', borderRadius: '8px' },
          success: { iconTheme: { primary: '#2d7d46', secondary: 'white' } },
          error: { iconTheme: { primary: '#c0392b', secondary: 'white' } },
        }}
      />

      <Router>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/login" element={<LoginPage />} />

          {/* ===== PROTECTED ROUTES (login required) ===== */}

          {/* Dashboard — all roles (data filtered by role on backend) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Purchases — Admin, BaseCommander, LogisticsOfficer */}
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <Layout><PurchasesPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Transfers — Admin, BaseCommander, LogisticsOfficer */}
          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <Layout><TransfersPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Assignments & Expenditures — Admin and BaseCommander only */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander']}>
                <Layout><AssignmentsPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Audit Logs — Admin only */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout><AuditLogsPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Panel — Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout><AdminPage /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Root → redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
