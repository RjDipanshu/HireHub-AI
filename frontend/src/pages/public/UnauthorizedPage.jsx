import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage = () => {
  const { user, role, logout, getDashboardPath } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const currentRole = (state.currentRole || role || 'GUEST').toUpperCase();
  const requiredRoles = state.requiredRoles || [];
  const attemptedPath = state.attemptedPath || '';

  const handleSwitchAccount = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
        }}
      >
        <ShieldAlert size={36} color="#ef4444" />
      </div>

      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#ef4444',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <Lock size={14} /> 403 Forbidden Access
      </div>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
        Access Restricted
      </h1>

      <p style={{ maxWidth: '520px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
        You do not have the required role permissions to view the requested page
        {attemptedPath ? <code> {attemptedPath}</code> : ''}.
      </p>

      {/* Role Comparison Box */}
      {requiredRoles.length > 0 && (
        <div
          className="card"
          style={{
            padding: '1rem 1.75rem',
            maxWidth: '460px',
            width: '100%',
            marginBottom: '2rem',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase' }}>
              Your Role
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.2rem' }}>
              {currentRole}
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary, #94a3b8)' }}>→</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase' }}>
              Required Role
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
              {requiredRoles.join(' or ')}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to={getDashboardPath()}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
        >
          <LayoutDashboard size={16} /> Go to My {role} Dashboard
        </Link>

        <Link
          to="/"
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
        >
          <ArrowLeft size={16} /> Return Home
        </Link>

        <button
          onClick={handleSwitchAccount}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem' }}
        >
          <LogOut size={16} /> Switch Account
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
