import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Briefcase, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage = () => {
  const { isAuthenticated, getDashboardPath, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          fontSize: '7rem',
          fontFamily: 'var(--font-heading, sans-serif)',
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: '0.75rem',
          letterSpacing: '-0.04em',
        }}
        className="text-gradient"
      >
        404
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        Page Not Found
      </h1>

      <p style={{ maxWidth: '500px', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, marginBottom: '2rem' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.3rem' }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        {isAuthenticated ? (
          <Link
            to={getDashboardPath()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.3rem' }}
          >
            <LayoutDashboard size={16} /> My {role} Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.3rem' }}
          >
            <Home size={16} /> Return Home
          </Link>
        )}

        <Link
          to="/jobs"
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.3rem' }}
        >
          <Search size={16} /> Explore Jobs
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
