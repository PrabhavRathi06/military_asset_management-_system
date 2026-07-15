// =============================================
// App.jsx
// Root component - sets up routing for the entire app
// We'll add more routes as we build each part
// =============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (we'll create these in upcoming parts)
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import PurchasesPage from './pages/PurchasesPage';
// import TransfersPage from './pages/TransfersPage';
// import AssignmentsPage from './pages/AssignmentsPage';
// import AuditLogsPage from './pages/AuditLogsPage';
// import AdminPage from './pages/AdminPage';

// Temporary placeholder page while we build
const ComingSoon = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>🪖 {title}</h2>
    <p style={{ marginTop: '0.5rem', color: '#718096' }}>Coming soon...</p>
  </div>
);

// -----------------------------------------------
// Main App with routing
// -----------------------------------------------
function App() {
  return (
    <AuthProvider>
      {/* react-hot-toast notification container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '0.875rem',
            borderRadius: '8px',
          },
        }}
      />

      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<ComingSoon title="Login Page" />} />

          {/* Protected routes - will be added in Part 2 */}
          <Route path="/dashboard" element={<ComingSoon title="Dashboard" />} />
          <Route path="/purchases" element={<ComingSoon title="Purchases" />} />
          <Route path="/transfers" element={<ComingSoon title="Transfers" />} />
          <Route path="/assignments" element={<ComingSoon title="Assignments & Expenditures" />} />
          <Route path="/audit-logs" element={<ComingSoon title="Audit Logs" />} />
          <Route path="/admin" element={<ComingSoon title="Admin Panel" />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
