import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  Search,
  UserCheck,
  Cpu,
  Video,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, getDashboardPath } = useAuth();

  // Status: 'verifying' | 'verified' | 'unverified' | 'invalid'
  const [status, setStatus] = useState('verifying');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Verification link processing on mount
  useEffect(() => {
    let mounted = true;

    const processVerification = async () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      // 1. Check for URL error params (e.g. otp_expired)
      const hasError =
        hash.includes('error=') ||
        hash.includes('error_code=') ||
        search.includes('error=') ||
        search.includes('error_code=');

      if (hasError) {
        if (mounted) {
          setStatus('invalid');
        }
        return;
      }

      // 2. Check if this is an incoming email verification callback
      const hasVerifyIndicator =
        hash.includes('type=signup') ||
        hash.includes('type=email_change') ||
        hash.includes('access_token') ||
        search.includes('code=') ||
        search.includes('verified=true');

      // 3. Listen for Supabase auth state change
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user?.email_confirmed_at || hasVerifyIndicator) {
            setStatus('verified');
          }
        }
      });

      // 4. Check active session
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.email_confirmed_at || (data?.session && hasVerifyIndicator)) {
          if (mounted) {
            setStatus('verified');
            if (data?.session?.user?.email) {
              setEmail(data.session.user.email);
            }
          }
          return;
        }

        // If user came directly to /verify-email without a confirmation token
        if (!hasVerifyIndicator) {
          if (mounted) {
            setStatus('unverified');
          }
          return;
        }

        // Dev mode simulation fallback
        const isDummy =
          !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('dummy');

        if (isDummy) {
          if (mounted) {
            setStatus('verified');
          }
          return;
        }

        if (mounted) {
          setStatus('unverified');
        }
      } catch (err) {
        if (mounted) {
          setStatus('invalid');
        }
      }

      return () => {
        subscription?.unsubscribe();
      };
    };

    processVerification();

    return () => {
      mounted = false;
    };
  }, []);

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      setResendError('Please enter your email address.');
      return;
    }

    setResendError('');
    setResendMessage('');
    setResendLoading(true);

    try {
      await authService.resendVerificationEmail(targetEmail);
      setResendMessage("Verification email sent! Check your inbox and spam folder.");
      setCooldown(60);
    } catch (err) {
      setResendError(err?.message || 'Failed to resend verification email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const featureCards = [
    {
      icon: <Search size={20} color="#0a66c2" />,
      title: 'Discover Relevant Jobs',
      description: 'Explore curated job opportunities precisely tailored to your career goals and preferences.',
    },
    {
      icon: <UserCheck size={20} color="#057642" />,
      title: 'Build Your Professional Profile',
      description: 'Highlight your skills, certifications, and portfolio for leading recruiters.',
    },
    {
      icon: <FileText size={20} color="#7c3aed" />,
      title: 'AI Resume Analysis',
      description: 'Receive real-time ATS scoring, keyword optimization, and resume enhancement feedback.',
    },
    {
      icon: <Cpu size={20} color="#d97706" />,
      title: 'AI Job Matching',
      description: 'Predict candidate-job fit scores powered by deep recruitment intelligence.',
    },
    {
      icon: <Video size={20} color="#dc2626" />,
      title: 'Interview Preparation',
      description: 'Prepare with AI-driven mock interviews, role-specific questions, and coaching tips.',
    },
  ];

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
          maxWidth: status === 'verified' ? '680px' : '480px',
          width: '100%',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* State A: Verifying */}
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <span
              className="spinner"
              style={{
                width: '36px',
                height: '36px',
                borderWidth: '3px',
                borderTopColor: 'var(--color-primary)',
                margin: '0 auto 1.25rem',
                display: 'block',
              }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Verifying Your Email...
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Please wait while we confirm your account credentials with HireHub AI.
            </p>
          </div>
        )}

        {/* State B: Verified / Welcome Experience */}
        {status === 'verified' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: 'rgba(5, 118, 66, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={32} color="#057642" />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.8rem',
                  background: '#e8f3fc',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: '0.75rem',
                }}
              >
                <Sparkles size={14} /> Email Confirmed
              </div>

              <h1
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '0.45rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome to HireHub AI 🚀
              </h1>
              <p
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Your career journey starts here.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
                Your email has been verified. You now have full access to HireHub AI’s suite of recruitment and career acceleration tools.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '0.85rem',
                marginBottom: '2rem',
              }}
            >
              {featureCards.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      flexShrink: 0,
                    }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {feat.title}
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <Link
                to={user ? getDashboardPath(role) : '/login'}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  padding: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                {user ? 'Go to Dashboard' : 'Sign In to Your Account'} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* State C: Unverified / Check Your Email */}
        {status === 'unverified' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'var(--color-primary-light, #e8f3fc)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Mail size={26} color="var(--color-primary)" />
              </div>

              <h1
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                Check Your Email
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                We've dispatched a confirmation email to activate your account.
              </p>
            </div>

            {email && (
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
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Verification sent to:
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {email}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  Click the link in the message to confirm your account. Don't forget to check your spam/junk folder.
                </div>
              </div>
            )}

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
                }}
              >
                <CheckCircle2 size={16} />
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
                }}
              >
                <AlertCircle size={16} />
                <span>{resendError}</span>
              </div>
            )}

            {!email && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Enter your registered email:
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleResend}
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
                marginBottom: '1rem',
              }}
            >
              {resendLoading ? (
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'currentColor' }} />
              ) : (
                <RefreshCw size={15} />
              )}
              {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Verification Email'}
            </button>

            <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* State D: Invalid / Expired */}
        {status === 'invalid' && (
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
              }}
            >
              Verification Link Expired
            </h1>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '1.5rem',
              }}
            >
              This email verification link is invalid or has expired. Please request a new verification email below to activate your account.
            </p>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Your Email Address:
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={16} />
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
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{resendError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0}
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
                cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                opacity: cooldown > 0 ? 0.65 : 1,
                marginBottom: '1rem',
              }}
            >
              {resendLoading ? (
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: '#ffffff' }} />
              ) : (
                <RefreshCw size={15} />
              )}
              {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Verification Email'}
            </button>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default VerifyEmailPage;
