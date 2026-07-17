// =============================================
// pages/NotFoundPage.jsx
// 404 Page — shown when a URL doesn't match any route
// =============================================

import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <Shield size={48} color="rgba(200,168,75,0.8)" style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ color: 'white', fontSize: '5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>404</h1>
      <h2 style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginTop: '0.75rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
        The page you are looking for does not exist or you don't have access.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate('/login')}
          className="btn-secondary"
          style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
