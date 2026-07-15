// =============================================
// context/AuthContext.jsx
// Global Authentication State
// This makes the logged-in user info available
// to ALL components in the app without prop drilling
// =============================================

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context (think of it as a global store)
const AuthContext = createContext(null);

// -----------------------------------------------
// AuthProvider wraps the entire app
// Any component inside can access auth state
// -----------------------------------------------
export const AuthProvider = ({ children }) => {
  // Store user info and token in state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check localStorage

  // On app start, check if there's a saved login in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      // User was already logged in - restore their session
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    setLoading(false); // Done checking
  }, []);

  // -----------------------------------------------
  // Login function - called after successful API login
  // Saves token and user to state AND localStorage
  // -----------------------------------------------
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // -----------------------------------------------
  // Logout function - clears everything
  // -----------------------------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // -----------------------------------------------
  // Helper: check if the current user has a specific role
  // Usage: isRole('Admin') or isRole(['Admin', 'BaseCommander'])
  // -----------------------------------------------
  const isRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,          // { _id, name, email, role, baseId }
        token,         // JWT string
        loading,       // true while restoring session
        login,         // function to log in
        logout,        // function to log out
        isRole,        // function to check role
        isLoggedIn: !!user, // boolean: true if logged in
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook - makes it easy to use AuthContext
// Usage: const { user, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
