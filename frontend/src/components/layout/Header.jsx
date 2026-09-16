import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sparkles, User, Building2, Shield, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

export const Header = ({ onMenuClick, title = 'Dashboard' }) => {
  const { profile, role, switchRole } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    notificationService
      .getUnreadCount()
      .then((count) => setUnreadCount(count))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          className="mobile-toggle"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={22} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Instant Profile Switcher Dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#1e293b',
            }}
            title="Click to switch profile (Candidate / Recruiter / Admin)"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: role === 'ADMIN' ? '#7c3aed' : role === 'RECRUITER' ? '#2563eb' : '#059669',
              }}
            />
            <span>{role || 'PROFILE'}</span>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: '210px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                padding: '0.4rem',
                zIndex: 1000,
              }}
            >
              <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--color-primary)' : '#1e293b',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={15} color={color} /> {label}
                    </span>
                    {isCurrent && <Check size={14} color="var(--color-primary)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            title="Notifications"
          >
            <Bell size={18} />
          </button>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {/* User avatar indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#e8f3fc',
            border: '1px solid #c8e1f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'var(--color-primary)',
          }}>
            {(profile?.fullName || 'U')[0]}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
