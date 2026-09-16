import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import authService from '../../services/authService';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RESEND_COOLDOWN_SECONDS = 60;

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRef = useRef(null);

  // Focus the email input on initial mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cooldown countdown timer for rate-limit protection and duplicate submission prevention
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Please enter your email address.';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@company.com).';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError('');
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading || cooldown > 0) return;

    const trimmedEmail = email.trim();
    const validationMessage = validateEmail(trimmedEmail);
    if (validationMessage) {
      setFieldError(validationMessage);
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setFieldError('');
    setError('');
    setLoading(true);

    try {
      await authService.resetPassword(trimmedEmail);
      setSubmitted(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err?.message || 'Unable to process password reset at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setSubmitted(false);
    setError('');
    setFieldError('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
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
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: submitted ? 'rgba(5, 118, 66, 0.1)' : 'var(--color-primary-light, #e8f3fc)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              transition: 'all 0.3s ease',
            }}
          >
            {submitted ? (
              <CheckCircle2 size={24} color="#057642" />
            ) : (
              <ShieldCheck size={24} color="var(--color-primary)" />
            )}
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
            {submitted ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {submitted
              ? 'Password recovery instructions have been dispatched.'
              : "Enter your registered email and we'll send you secure instructions to reset your password."}
          </p>
        </div>

        {/* Global Error Banner */}
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

        {submitted ? (
          /* Success State (Account Enumeration Protected) */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: '0.925rem',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                If an account exists for this email address, we've sent password reset instructions.
              </p>
              {email && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.85rem',
                  }}
                >
                  Requested for: <strong>{email.trim().toLowerCase()}</strong>
                </p>
              )}
              <ul
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  paddingLeft: '1.2rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                <li>Click the link inside the email to choose a new password.</li>
                <li>The reset link is time-sensitive and expires in 1 hour.</li>
                <li>Be sure to check your spam or junk folder if it doesn't appear shortly.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || cooldown > 0}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  opacity: cooldown > 0 ? 0.65 : 1,
                }}
              >
                {loading ? (
                  <span
                    className="spinner"
                    style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'currentColor' }}
                  />
                ) : (
                  <RefreshCw size={15} />
                )}
                {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Reset Link'}
              </button>

              <button
                type="button"
                onClick={handleEditEmail}
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'underline',
                }}
              >
                Try a different email address
              </button>

              <div style={{ marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <Link
                  to="/login"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="forgot-password-email"
                className="form-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                <Mail size={15} color="var(--text-secondary)" /> Email Address
              </label>
              <input
                ref={inputRef}
                id="forgot-password-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!!fieldError}
                aria-describedby={fieldError ? 'email-format-error' : undefined}
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={handleEmailChange}
                disabled={loading}
                style={{
                  borderColor: fieldError ? '#ef4444' : undefined,
                  boxShadow: fieldError ? '0 0 0 1px #ef4444' : undefined,
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              />
              {fieldError && (
                <div
                  id="email-format-error"
                  role="alert"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginTop: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#dc2626',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{fieldError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
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
              }}
              disabled={loading}
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
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <div
              style={{
                textAlign: 'center',
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle, #e5e7eb)',
              }}
            >
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  transition: 'color 0.15s ease',
                }}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--color-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
