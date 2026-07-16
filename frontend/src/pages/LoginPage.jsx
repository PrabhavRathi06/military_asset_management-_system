// =============================================
// pages/LoginPage.jsx
// Login Page
//
// - User enters email + password
// - Calls POST /api/auth/login
// - On success: saves token, redirects to dashboard
// - On failure: shows error message
// =============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -----------------------------------------------
  // Handle form submission
  // -----------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setError('');
    setLoading(true);

    try {
      // Call the backend login API
      const response = await axiosInstance.post('/auth/login', { email, password });

      if (response.data.success) {
        // Save user + token to context and localStorage
        login(response.data.user, response.data.token);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      // Show the error message from backend (or a generic one)
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Quick login buttons for demo (fills in credentials)
  // -----------------------------------------------
  const quickFill = (role) => {
    const credentials = {
      Admin: { email: 'admin@military.com', password: 'Admin@123' },
      BaseCommander: { email: 'commander@military.com', password: 'Commander@123' },
      LogisticsOfficer: { email: 'logistics@military.com', password: 'Logistics@123' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    setError('');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <Shield size={32} color="#c8a84b" />
          </div>
          <h1 style={styles.title}>MilAsset</h1>
          <p style={styles.subtitle}>Military Asset Management System</p>
        </div>

        {/* Login Form Card */}
        <div className="card" style={styles.card}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', fontSize: '1.1rem' }}>
            Sign In to Your Account
          </h2>

          {/* Error Message */}
          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : 'Sign In'}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div style={styles.demoSection}>
            <p style={styles.demoLabel}>Demo Accounts</p>
            <div style={styles.demoButtons}>
              <button onClick={() => quickFill('Admin')} style={styles.demoBtn}>
                Admin
              </button>
              <button onClick={() => quickFill('BaseCommander')} style={styles.demoBtn}>
                Commander
              </button>
              <button onClick={() => quickFill('LogisticsOfficer')} style={styles.demoBtn}>
                Logistics
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          Secure Military Asset Management • All access is logged
        </p>
      </div>
    </div>
  );
};

// ---- Inline styles for the login page ----
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  logoCircle: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    border: '1px solid rgba(200, 168, 75, 0.4)',
  },
  title: {
    color: 'white',
    fontSize: '1.75rem',
    fontWeight: '700',
    margin: 0,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  card: {
    borderRadius: '10px',
    padding: '2rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  demoSection: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-border)',
  },
  demoLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  demoButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  demoBtn: {
    flex: 1,
    padding: '0.4rem',
    fontSize: '0.75rem',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    background: 'var(--color-bg)',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.25rem',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.75rem',
  },
};

export default LoginPage;
