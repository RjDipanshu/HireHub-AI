import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Verifying authentication credentials...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error: authErr } = await supabase.auth.getSession();
        if (authErr) throw authErr;

        if (data?.session) {
          setMessage('Email confirmed! Redirecting to your dashboard...');
          const userRole = data.session.user?.user_metadata?.role || role || 'CANDIDATE';
          setTimeout(() => {
            if (userRole === 'RECRUITER') {
              navigate('/recruiter/dashboard', { replace: true });
            } else if (userRole === 'ADMIN') {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/candidate/dashboard', { replace: true });
            }
          }, 1200);
        } else {
          // If no session found in URL hash
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback verification error:', err);
        setError(err?.message || 'Failed to verify email confirmation link.');
      }
    };

    handleAuthCallback();
  }, [navigate, role]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        {error ? (
          <div>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Verification Issue</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-sm">
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <LoadingSpinner size="lg" label={message} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
