import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Briefcase, User, LogOut, Menu, X, LayoutDashboard, TrendingUp, Building2, Shield, ChevronDown, Check, LifeBuoy, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = () => {
  const { isAuthenticated, user, profile, role, logout, getDashboardPath, switchRole } = useAuth();
  const { theme, preference, toggleTheme, isDark } = useTheme();
  const { lang, changeLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close role menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRoleSwitch = async (targetRole, targetPath) => {
    setShowRoleMenu(false);
    if (role === targetRole) {
      navigate(targetPath);
      return;
    }
    try {
      await switchRole(targetRole);
      window.location.href = targetPath;
    } catch (err) {
      console.error('Failed to switch profile:', err);
    }
  };

  const dashboardTarget = getDashboardPath ? getDashboardPath() : (
    role === 'RECRUITER' ? '/recruiter/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/candidate/dashboard'
  );

  return (
    <nav
      role="navigation"
      aria-label="Main Navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: isDark ? '#1e293b' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
        padding: '0.75rem 1.75rem',
      }}
    >
      <div style={{
        maxWidth: 'var(--container-max-width, 1200px)',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }} aria-label="HireHub AI Home">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Briefcase size={20} color="#ffffff" />
          </div>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            HireHub <span style={{ color: 'var(--color-primary)' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link to="/jobs" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <Briefcase size={16} /> {t('nav.explore_jobs', 'Explore Jobs')}
          </Link>
          <Link to="/salaries" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <TrendingUp size={16} color="var(--primary-500, #6366f1)" /> {t('nav.salaries', 'Salaries')}
          </Link>
          <Link to="/support" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <LifeBuoy size={16} color="var(--color-primary)" /> {t('nav.support', 'Support')}
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to={dashboardTarget} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Instant Profile Switcher Dropdown in Navbar */}
                <div ref={roleMenuRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#1e293b',
                    }}
                    title="Click to switch profile (Candidate / Recruiter / Admin)"
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: role === 'ADMIN' ? '#7c3aed' : role === 'RECRUITER' ? '#2563eb' : '#059669',
                      }}
                    />
                    <span>{role || 'PROFILE'}</span>
                    <ChevronDown size={13} color="#64748b" />
                  </button>

                  {showRoleMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 6px)',
                        width: '200px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        padding: '0.4rem',
                        zIndex: 1000,
                      }}
                    >
                      <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Switch Profile
                      </div>

                      {[
                        { r: 'CANDIDATE', label: 'Candidate Portal', icon: User, color: '#059669', path: '/candidate/dashboard' },
                        { r: 'RECRUITER', label: 'Recruiter Portal', icon: Building2, color: '#2563eb', path: '/recruiter/dashboard' },
                        { r: 'ADMIN', label: 'Admin Portal', icon: Shield, color: '#7c3aed', path: '/admin/dashboard' },
                      ].map(({ r, label, icon: Icon, color, path }) => {
                        const isCurrent = role === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleSwitch(r, path)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.45rem 0.6rem',
                              borderRadius: '6px',
                              border: 'none',
                              background: isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? 'var(--color-primary)' : '#1e293b',
                              textAlign: 'left',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <Icon size={14} color={color} /> {label}
                            </span>
                            {isCurrent && <Check size={13} color="var(--color-primary)" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {profile?.fullName || user?.email?.split('@')[0]}
                </span>
                {/* Language Selector */}
                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value)}
                  title="Select Language"
                  aria-label="Select Language"
                  style={{
                    padding: '0.3rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: isDark ? '#1e293b' : '#f8fafc',
                    color: 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <option value="en">🇺🇸 EN</option>
                  <option value="hi">🇮🇳 हिंदी</option>
                  <option value="es">🇪🇸 ES</option>
                </select>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="btn btn-secondary btn-sm"
                  title={`Theme: ${preference} (click to toggle)`}
                  aria-label={`Current theme: ${preference}. Click to toggle.`}
                  style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }}
                >
                  {preference === 'dark' ? <Moon size={15} /> : preference === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                  aria-label="Sign out"
                  style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Language Selector */}
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                title="Select Language"
                aria-label="Select Language"
                style={{
                  padding: '0.3rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: isDark ? '#1e293b' : '#f8fafc',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <option value="en">🇺🇸 EN</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="es">🇪🇸 ES</option>
              </select>

              <button
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
                title={`Theme: ${preference}`}
                aria-label={`Current theme: ${preference}. Click to toggle.`}
                style={{ padding: '0.35rem 0.6rem', color: 'var(--text-secondary)' }}
              >
                {preference === 'dark' ? <Moon size={15} /> : preference === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
              </button>
              <Link to="/login" className="btn btn-outline btn-sm">
                {t('nav.sign_in', 'Sign In')}
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('nav.get_started', 'Get Started')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: 'var(--text-primary)' }}
          className="mobile-toggle"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="region"
          aria-label="Mobile Navigation Menu"
          style={{
            marginTop: '0.75rem',
            padding: '1rem 0.5rem',
            borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: isDark ? '#1e293b' : '#ffffff',
          }}
        >
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
          >
            <Briefcase size={16} /> Explore Jobs
          </Link>
          <Link
            to="/salaries"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
          >
            <TrendingUp size={16} color="var(--primary-500, #6366f1)" /> Salaries & Insights
          </Link>
          <Link
            to="/support"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
          >
            <LifeBuoy size={16} color="var(--color-primary)" /> Help & Support
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardTarget}
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="btn btn-danger btn-sm"
                style={{ width: 'fit-content', marginTop: '0.5rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

