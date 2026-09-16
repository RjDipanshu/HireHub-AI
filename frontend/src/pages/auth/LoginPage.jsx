import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Mail, Lock, LogIn, AlertCircle, User, Shield, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname;
  const targetDestination = (from && from !== '/' && from !== '/login') ? from : null;

  const handleDemoLogin = async (demoRole) => {
    const demoEmail = `${demoRole.toLowerCase()}@hirehub.ai`;
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);

    try {
      const data = await login(demoEmail, 'password123');
      if (demoRole === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else if (demoRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[LoginPage] Demo sign-in error:', err);
      setError(err?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const userRole = (data?.user?.user_metadata?.role || data?.user?.role || 'CANDIDATE').toUpperCase();

      // Redirect based on previous destination or role
      if (targetDestination) {
        navigate(targetDestination, { replace: true });
      } else if (userRole === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else if (userRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[LoginPage] Sign-in error:', err);
      const msg = err?.message || 'Invalid email or password credentials.';
      if (msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('apikey')) {
        setError('Supabase Anon Key is missing or invalid. Check VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 180px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      backgroundColor: 'var(--color-background)',
    }}>
      <div className="card" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.25rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
          }}>
            <Briefcase size={22} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Sign in to access your HireHub AI dashboard
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Quick 1-Click Profile Login Box */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #f8faff, #f1f5f9)',
          border: '1px solid #e0e7ff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', marginBottom: '0.65rem' }}>
            <Sparkles size={14} /> 1-Click Quick Profile Login
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('CANDIDATE')}
              style={{
                padding: '0.6rem 0.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              title="candidate@hirehub.ai"
            >
              <User size={16} color="#059669" style={{ margin: '0 auto 4px', display: 'block' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Candidate</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Job Seeker</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('RECRUITER')}
              style={{
                padding: '0.6rem 0.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              title="recruiter@hirehub.ai"
            >
              <Building2 size={16} color="#2563eb" style={{ margin: '0 auto 4px', display: 'block' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Recruiter</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Employer</div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('ADMIN')}
              style={{
                padding: '0.6rem 0.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
              title="admin@hirehub.ai"
            >
              <Shield size={16} color="#7c3aed" style={{ margin: '0 auto 4px', display: 'block' }} />
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Admin</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Platform</div>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>OR ENTER CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={14} color="var(--text-secondary)" /> Email Address
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <Lock size={14} color="var(--text-secondary)" /> Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.825rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.85rem', padding: '0.7rem' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#ffffff' }} />
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

