// =============================================
// components/ProtectedRoute.jsx
// Guards pages from unauthenticated access
//
// If user is NOT logged in → redirect to /login
// If user IS logged in → show the page
//
// Usage in App.jsx:
//   <Route path="/dashboard" element={
//     <ProtectedRoute><DashboardPage /></ProtectedRoute>
//   } />
//
// For role-restricted pages:
//   <ProtectedRoute allowedRoles={['Admin']}>
//     <AdminPage />
//   </ProtectedRoute>
// =============================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, user, loading } = useAuth();

  // While we're checking localStorage for a saved session, show nothing
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Not logged in → go to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have the right role
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed → render the actual page
  return children;
};

export default ProtectedRoute;
