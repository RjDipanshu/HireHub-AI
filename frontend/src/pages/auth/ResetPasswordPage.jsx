import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import authService from '../../services/authService';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();

  // Session verification state
  const [sessionStatus, setSessionStatus] = useState('checking'); // 'checking' | 'valid' | 'invalid'
  const [sessionError, setSessionError] = useState('');

  // Form input state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Verify recovery session on component mount
  useEffect(() => {
    let mounted = true;

    const verifyRecoverySession = async () => {
      // Check URL for direct error payload returned by Supabase Auth (e.g. OTP expired)
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      const hasUrlError =
        hash.includes('error=') ||
        hash.includes('error_code=') ||
        search.includes('error=') ||
        search.includes('error_code=');

      if (hasUrlError) {
        if (mounted) {
          setSessionStatus('invalid');
          setSessionError('This password reset link is invalid or has expired.');
        }
        return;
      }

      // Check if URL indicates an incoming recovery flow (hash tokens, PKCE code, or recovery query)
      const hasRecoveryIndicator =
        hash.includes('type=recovery') ||
        hash.includes('access_token') ||
        search.includes('code=') ||
        search.includes('type=recovery') ||
        search.includes('recovery=true');

      // Listen for explicit PASSWORD_RECOVERY event from Supabase client
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && hasRecoveryIndicator)) {
          setSessionStatus('valid');
        }
      });

      // Verify active session
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          if (mounted) {
            setSessionStatus('valid');
          }
          return;
        }

        // In dev environment or dummy-key setup, permit recovery simulation
        const isDummy =
          !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('dummy');

        if (hasRecoveryIndicator || (isDummy && (search.includes('recovery') || import.meta.env.DEV))) {
          if (mounted) {
            setSessionStatus('valid');
          }
          return;
        }

        // If no session and no recovery parameters are present, mark as invalid
        if (mounted) {
          setSessionStatus('invalid');
          setSessionError('This password reset link is invalid or has expired.');
        }
      } catch (err) {
        if (mounted) {
          setSessionStatus('invalid');
          setSessionError('This password reset link is invalid or has expired.');
        }
      }

      return () => {
        subscription?.unsubscribe();
      };
    };

    verifyRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Password Requirements & Strength Calculation
  const requirements = [
    { id: 'length', label: 'Minimum 8 characters', met: password.length >= 8 },
    { id: 'uppercase', label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'At least one number (0-9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'At least one special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const allRequirementsMet = metCount === requirements.length;
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = allRequirementsMet && passwordsMatch && !loading;

  const getStrengthInfo = () => {
    if (password.length === 0) return { label: '', percent: 0, color: '#e2e8f0' };
    if (metCount <= 2) return { label: 'Weak', percent: 25, color: '#ef4444' };
    if (metCount === 3) return { label: 'Fair', percent: 50, color: '#f59e0b' };
    if (metCount === 4) return { label: 'Good', percent: 75, color: '#3b82f6' };
    return { label: 'Strong', percent: 100, color: '#10b981' };
  };

  const strength = getStrengthInfo();

  // 3. Handle Password Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      await authService.updatePassword(password);

      // Invalidate recovery session so user can log in with new credentials cleanly
      try {
        await authService.signOut();
      } catch {}

      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Unable to update password. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      role="main"
      style={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.25rem',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* State A: Checking Session */}
        {sessionStatus === 'checking' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <span
              className="spinner"
              style={{
                width: '32px',
                height: '32px',
                borderWidth: '3px',
                borderTopColor: 'var(--color-primary)',
                margin: '0 auto 1.25rem',
                display: 'block',
              }}
            />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Verifying Reset Link...
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Please wait while we validate your secure password recovery session.
            </p>
          </div>
        )}

        {/* State B: Invalid / Expired Recovery Link */}
        {sessionStatus === 'invalid' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#fef2f2',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={28} color="#dc2626" />
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.6rem',
                letterSpacing: '-0.02em',
              }}
            >
              Reset Link Expired
            </h1>

            <p
              style={{
                fontSize: '0.925rem',
                color: '#991b1b',
                fontWeight: 500,
                lineHeight: 1.5,
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: '#fef2f2',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #fecaca',
              }}
            >
              {sessionError || 'This password reset link is invalid or has expired.'}
            </p>

            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '1.75rem',
              }}
            >
              Password recovery links are single-use and expire after 1 hour for your account's protection.
              Please request a new link to proceed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/forgot-password"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Request New Reset Link
              </Link>

              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* State C: Success Message */}
        {sessionStatus === 'valid' && success && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(5, 118, 66, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={30} color="#057642" />
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.6rem',
                letterSpacing: '-0.02em',
              }}
            >
              Password Updated
            </h1>

            <p
              style={{
                fontSize: '0.925rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                lineHeight: 1.55,
                marginBottom: '1.75rem',
                padding: '0.85rem 1rem',
                background: '#f0fdf4',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #bbf7d0',
              }}
            >
              Your password has been updated successfully. You can now sign in with your new password.
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                fontSize: '0.925rem',
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* State D: Valid Recovery Session - Reset Password Form */}
        {sessionStatus === 'valid' && !success && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--color-primary-light, #e8f3fc)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <KeyRound size={22} color="var(--color-primary)" />
              </div>

              <h1
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Create New Password
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Choose a strong, unique password for your HireHub AI account.
              </p>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* New Password Field */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="new-password"
                  className="form-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Lock size={14} color="var(--text-secondary)" /> New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    disabled={loading}
                    className="form-input"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Password Strength:
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: strength.color,
                      }}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${strength.percent}%`,
                        backgroundColor: strength.color,
                        transition: 'width 0.3s ease, background-color 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Clear Password Requirements Checklist */}
              <div
                style={{
                  padding: '0.75rem 0.85rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.5rem',
                  }}
                >
                  Password Requirements
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        color: req.met ? '#057642' : 'var(--text-secondary)',
                        fontWeight: req.met ? 600 : 400,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {req.met ? (
                        <Check size={14} color="#057642" style={{ flexShrink: 0 }} />
                      ) : (
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '1.5px solid #94a3b8',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="confirm-password"
                  className="form-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Lock size={14} color="var(--text-secondary)" /> Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    disabled={loading}
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    style={{
                      paddingRight: '2.5rem',
                      borderColor:
                        confirmPassword.length > 0 && !passwordsMatch ? '#ef4444' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.35rem',
                      fontSize: '0.78rem',
                      color: '#dc2626',
                    }}
                  >
                    <X size={13} />
                    <span>Passwords do not match</span>
                  </div>
                )}
                {confirmPassword.length > 0 && passwordsMatch && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginTop: '0.35rem',
                      fontSize: '0.78rem',
                      color: '#057642',
                    }}
                  >
                    <Check size={13} />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
                  opacity: !canSubmit || loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderWidth: '2px',
                        borderTopColor: '#ffffff',
                      }}
                    />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle, #e5e7eb)',
              }}
            >
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ResetPasswordPage;
