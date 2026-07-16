// =============================================
// App.jsx
// Root component - sets up routing for the entire app
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

// Placeholder pages (will be replaced in upcoming parts)
const ComingSoon = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2 style={{ color: 'var(--color-primary)' }}>🪖 {title}</h2>
    <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
      This section is being built in the next part...
    </p>
  </div>
);

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

          {/* Dashboard - all roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Purchases - all roles */}
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <Layout>
                  <PurchasesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Transfers - all roles */}
          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <Layout>
                  <TransfersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Assignments & Expenditures - Admin and BaseCommander only */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander']}>
                <Layout>
                  <AssignmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Audit Logs - Admin only */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <ComingSoon title="Audit Logs — Coming in Part 7" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Panel - Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <ComingSoon title="Admin Panel — Coming in Part 7" />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default: redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
