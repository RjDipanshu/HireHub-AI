import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  FileText,
  Cpu,
  Video,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

export const RegisterPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('CANDIDATE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Resend verification state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Password validation rules
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Password must meet all 5 security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setLoading(true);

    try {
      const data = await signup({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        phone: phone.trim(),
      });

      // If email confirmation is enabled in Supabase and no active session was returned immediately
      if (data?.user && !data?.session) {
        setNeedsVerification(true);
        setCooldown(60);
      } else {
        setSuccess(true);
        setTimeout(() => {
          if (role === 'RECRUITER') {
            navigate('/recruiter/dashboard');
          } else {
            navigate('/candidate/dashboard');
          }
        }, 1500);
      }
    } catch (err) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendLoading || cooldown > 0) return;
    setResendError('');
    setResendMessage('');
    setResendLoading(true);

    try {
      await authService.resendVerificationEmail(email.trim());
      setResendMessage('Verification email sent! Check your inbox and spam folder.');
      setCooldown(60);
    } catch (err) {
      setResendError(err?.message || 'Failed to resend verification email. Please try again later.');
    } finally {
      setResendLoading(false);
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
          maxWidth: needsVerification ? '520px' : '480px',
          width: '100%',
          padding: '2.25rem',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.3s ease',
        }}
      >
        {needsVerification ? (
          /* Check Your Email Verification State */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'var(--color-primary-light, #e8f3fc)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Mail size={28} color="var(--color-primary)" />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#15803d',
                marginBottom: '0.75rem',
              }}
            >
              <Sparkles size={14} /> Account Created
            </div>

            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
                letterSpacing: '-0.02em',
              }}
            >
              Check Your Email
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              A verification link has been sent to activate your account.
            </p>

            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Verification sent to:
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {email.trim()}
              </div>
              <ul
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.75rem',
                  paddingLeft: '1.2rem',
                  lineHeight: 1.55,
                  margin: '0.75rem 0 0',
                }}
              >
                <li>Click the link inside your email to verify your address.</li>
                <li>Check your spam or junk folder if the email doesn't appear shortly.</li>
                <li>After confirming, return here to sign in with your password.</li>
              </ul>
            </div>

            {resendMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  color: '#15803d',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{resendMessage}</span>
              </div>
            )}

            {resendError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{resendError}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || cooldown > 0}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  opacity: cooldown > 0 ? 0.65 : 1,
                }}
              >
                {resendLoading ? (
                  <span
                    className="spinner"
                    style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'currentColor' }}
                  />
                ) : (
                  <RefreshCw size={15} />
                )}
                {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Verification Email'}
              </button>

              <Link
                to="/login"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--color-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <Briefcase size={22} color="#ffffff" />
              </div>
              <h1
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                Create an Account
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Join HireHub AI as a candidate or hiring organization
              </p>
            </div>

            {/* Role Toggle Selector */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.35rem',
                background: '#f3f4f6',
                padding: '0.3rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <button
                type="button"
                onClick={() => setRole('CANDIDATE')}
                style={{
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  background: role === 'CANDIDATE' ? '#ffffff' : 'transparent',
                  color: role === 'CANDIDATE' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  border: role === 'CANDIDATE' ? '1px solid #d1d5db' : '1px solid transparent',
                  boxShadow: role === 'CANDIDATE' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                style={{
                  padding: '0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  background: role === 'RECRUITER' ? '#ffffff' : 'transparent',
                  color: role === 'RECRUITER' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  border: role === 'RECRUITER' ? '1px solid #d1d5db' : '1px solid transparent',
                  boxShadow: role === 'RECRUITER' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                Recruiter
              </button>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  color: '#15803d',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Check size={16} />
                <span>Account created successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="register-fullname"
                  className="form-label"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <User size={14} color="var(--text-secondary)" /> Full Name *
                </label>
                <input
                  id="register-fullname"
                  type="text"
                  required
                  autoComplete="name"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="register-email"
                  className="form-label"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <Mail size={14} color="var(--text-secondary)" /> Email Address *
                </label>
                <input
                  id="register-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="form-input"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="register-phone"
                  className="form-label"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <Phone size={14} color="var(--text-secondary)" /> Phone Number (Optional)
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="register-password"
                  className="form-label"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <Lock size={14} color="var(--text-secondary)" /> Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="Enter password"
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

              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <div
                  style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Password Requirements:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {requirements.map((req) => (
                      <div
                        key={req.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          fontSize: '0.78rem',
                          color: req.met ? '#057642' : 'var(--text-secondary)',
                          fontWeight: req.met ? 600 : 400,
                        }}
                      >
                        {req.met ? (
                          <Check size={13} color="#057642" />
                        ) : (
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
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
              )}

              {/* Confirm Password Field */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="register-confirm-password"
                  className="form-label"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <Lock size={14} color="var(--text-secondary)" /> Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className="form-input"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    style={{
                      paddingRight: '2.5rem',
                      borderColor: confirmPassword.length > 0 && !passwordsMatch ? '#ef4444' : undefined,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.78rem', color: '#dc2626' }}>
                    <X size={13} />
                    <span>Passwords do not match</span>
                  </div>
                )}
                {confirmPassword.length > 0 && passwordsMatch && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', fontSize: '0.78rem', color: '#057642' }}>
                    <Check size={13} />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontWeight: 600, fontSize: '0.925rem' }}
                disabled={loading || success}
              >
                {loading ? (
                  <span
                    className="spinner"
                    style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: '#ffffff' }}
                  />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
