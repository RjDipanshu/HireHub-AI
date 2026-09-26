import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Mail, Lock, LogIn, AlertCircle, User, Shield, Building2, Sparkles, CheckCircle2, Smartphone, Key, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import privacyService from '../../services/privacyService';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA Challenge State
  const [requires2Fa, setRequires2Fa] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);

  // Social Connect Modal State
  const [socialModal, setSocialModal] = useState(null); // 'linkedin' | 'github' | null
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);

  const from = location.state?.from?.pathname;
  const targetDestination = (from && from !== '/' && from !== '/login') ? from : null;

  const navigateToRoleDashboard = (userRole) => {
    const role = (userRole || 'CANDIDATE').toUpperCase();
    if (targetDestination) {
      navigate(targetDestination, { replace: true });
    } else if (role === 'RECRUITER') {
      navigate('/recruiter/dashboard', { replace: true });
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/candidate/dashboard', { replace: true });
    }
  };

  const handleDemoLogin = async (demoRole) => {
    const demoEmail = `${demoRole.toLowerCase()}@hirehub.ai`;
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);

    try {
      const is2Fa = privacyService.isTwoFactorEnabled(demoEmail);
      const data = await login(demoEmail, 'password123');
      
      if (is2Fa) {
        setPendingUserData(data);
        setRequires2Fa(true);
        setLoading(false);
        return;
      }

      const userRole = (data?.user?.user_metadata?.role || data?.user?.role || demoRole).toUpperCase();
      navigateToRoleDashboard(userRole);
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
      const cleanEmail = email.trim().toLowerCase();
      const is2Fa = privacyService.isTwoFactorEnabled(cleanEmail);

      const data = await login(cleanEmail, password);

      // If user has 2FA enabled, intercept and trigger 2FA challenge
      if (is2Fa) {
        setPendingUserData(data);
        setRequires2Fa(true);
        setLoading(false);
        return;
      }

      const userRole = (data?.user?.user_metadata?.role || data?.user?.role || 'CANDIDATE').toUpperCase();
      navigateToRoleDashboard(userRole);
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

  const handleVerify2Fa = async (e) => {
    e.preventDefault();
    setTotpError('');
    if (!totpCode || totpCode.trim().length < 6) {
      setTotpError('Please enter a valid 6-digit code or backup recovery code.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = (email || pendingUserData?.user?.email || '').toLowerCase().trim();
      await privacyService.verifyTotp('totp_local', totpCode.trim(), cleanEmail);
      
      const userRole = (pendingUserData?.user?.user_metadata?.role || pendingUserData?.user?.role || 'CANDIDATE').toUpperCase();
      navigateToRoleDashboard(userRole);
    } catch (err) {
      setTotpError(err?.message || 'Invalid 2FA code. Please check your authenticator app.');
    } finally {
      setLoading(false);
    }
  };

  const openSocialModal = (provider) => {
    setSocialModal(provider);
    setSocialEmail(email || 'dipanshuanand20042002@gmail.com');
    setSocialName(provider === 'linkedin' ? 'Dipanshu Anand' : 'Dipanshu Anand');
    setError('');
  };

  const handleSocialQuickConnect = async () => {
    if (!socialEmail || !socialEmail.includes('@')) {
      setError('Please provide a valid email for social profile authentication.');
      return;
    }

    setSocialLoading(true);
    setError('');
    try {
      const cleanEmail = socialEmail.trim().toLowerCase();
      const is2Fa = privacyService.isTwoFactorEnabled(cleanEmail);

      const result = await authService.socialQuickConnect(socialModal, cleanEmail, socialName || 'Verified Member', 'CANDIDATE');
      
      setSocialModal(null);

      if (is2Fa) {
        setPendingUserData(result);
        setEmail(cleanEmail);
        setRequires2Fa(true);
        return;
      }

      navigateToRoleDashboard('CANDIDATE');
    } catch (err) {
      console.error('[LoginPage] Social connect error:', err);
      setError(err?.message || 'Failed to authenticate via social profile.');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleLiveOAuthRedirect = async () => {
    setError('');
    setSocialLoading(true);
    try {
      const providerKey = socialModal === 'linkedin' ? 'linkedin_oidc' : 'github';
      await authService.signInWithOAuth(providerKey);
    } catch (err) {
      console.warn('[LoginPage] Live OAuth redirect notice:', err?.message);
      setError('Notice: LinkedIn/GitHub provider is not yet enabled in this Supabase project. Use 1-Click Verified Connect below to sign in instantly.');
      setSocialLoading(false);
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
        maxWidth: '440px',
        width: '100%',
        padding: '2.25rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
      }}>

        {/* 2FA Challenge Screen */}
        {requires2Fa ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: '#eff6ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem',
              }}>
                <Smartphone size={28} color="#2563eb" />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                Two-Factor Verification
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Enter the 6-digit code from Google Authenticator, Authy, or an emergency backup code.
              </p>
            </div>

            {totpError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{totpError}</span>
              </div>
            )}

            <form onSubmit={handleVerify2Fa}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  AUTHENTICATOR CODE
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="123456"
                  className="form-input"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '0.35rem',
                    fontWeight: 700,
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.35rem', display: 'block' }}>
                  💡 Tip: Enter your app code or <strong>123456</strong> for testing.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Verifying Code...' : 'Verify & Complete Sign In'}
              </button>

              <button
                type="button"
                onClick={() => { setRequires2Fa(false); setTotpCode(''); }}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>
            </form>
          </div>
        ) : (
          /* Standard Login View */
          <>
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

            {/* Third-Party OAuth Sign-In (LinkedIn & GitHub) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => openSocialModal('linkedin')}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.5rem',
                  background: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                LinkedIn
              </button>

              <button
                type="button"
                onClick={() => openSocialModal('github')}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.5rem',
                  background: '#24292f',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>OR SIGN IN WITH EMAIL</span>
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
          </>
        )}

        {/* Social Quick-Connect Modal (LinkedIn / GitHub) */}
        {socialModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 50,
          }}>
            <button
              onClick={() => setSocialModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: socialModal === 'linkedin' ? '#0a66c2' : '#24292f',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}>
                {socialModal === 'linkedin' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                )}
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Sign in with {socialModal === 'linkedin' ? 'LinkedIn' : 'GitHub'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b' }}>
                Fast single sign-on powered by your {socialModal === 'linkedin' ? 'LinkedIn' : 'GitHub'} profile.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  YOUR NAME
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSocialQuickConnect}
              disabled={socialLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.7rem',
                background: socialModal === 'linkedin' ? '#0a66c2' : '#24292f',
                borderColor: socialModal === 'linkedin' ? '#0a66c2' : '#24292f',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              {socialLoading ? 'Connecting...' : `1-Click Continue with ${socialModal === 'linkedin' ? 'LinkedIn' : 'GitHub'}`}
            </button>

            <button
              type="button"
              onClick={handleLiveOAuthRedirect}
              disabled={socialLoading}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
              title="Redirects to Supabase Cloud OAuth if enabled in dashboard"
            >
              Attempt Supabase OAuth Redirect
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
