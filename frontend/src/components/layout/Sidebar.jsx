import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Briefcase,
  PlusCircle,
  Calendar,
  Building2,
  Users,
  BarChart3,
  LogOut,
  Activity,
  Search,
  Megaphone,
  Award,
  MessageSquare,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ role = 'CANDIDATE', isOpen, onClose }) => {
  const { logout, profile } = useAuth();

  const candidateLinks = [
    { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidate/profile', label: 'My Profile', icon: User },
    { to: '/candidate/assessments', label: 'Skill Badges', icon: Award, badge: 'Quiz' },
    { to: '/candidate/messages', label: 'Messages / InMail', icon: MessageSquare },
    { to: '/candidate/applications', label: 'Applications', icon: FileText },
    { to: '/candidate/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { to: '/candidate/ai-tools', label: 'AI Career Studio', icon: Sparkles, badge: 'AI' },
    { to: '/jobs', label: 'Explore Jobs', icon: Briefcase },
    { to: '/support', label: 'Help & Support', icon: LifeBuoy },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/jobs', label: 'Job Postings', icon: Briefcase },
    { to: '/recruiter/jobs/new', label: 'Post a New Job', icon: PlusCircle },
    { to: '/recruiter/applications', label: 'Hiring Pipeline', icon: Users },
    { to: '/recruiter/candidates', label: 'Candidate Search', icon: Search },
    { to: '/recruiter/messages', label: 'Messages / InMail', icon: MessageSquare },
    { to: '/recruiter/interviews', label: 'Interviews', icon: Calendar },
    { to: '/recruiter/ai-tools', label: 'Recruiter AI', icon: Sparkles, badge: 'AI' },
    { to: '/recruiter/company', label: 'Company Profile', icon: Building2 },
    { to: '/recruiter/profile', label: 'My Profile', icon: User },
    { to: '/support', label: 'Help & Support', icon: LifeBuoy },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/jobs/moderation', label: 'Job Moderation', icon: Briefcase },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
    { to: '/admin/broadcast', label: 'Broadcast Center', icon: Megaphone },
    { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
    { to: '/admin/support', label: 'Support Tickets', icon: LifeBuoy, badge: 'New' },
    { to: '/admin/api-test', label: 'API Diagnostics', icon: Activity, badge: 'P3' },
  ];

  const links =
    role === 'RECRUITER'
      ? recruiterLinks
      : role === 'ADMIN'
      ? adminLinks
      : candidateLinks;

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 39,
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div style={{
        height: 'var(--topbar-height)',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Briefcase size={18} color="#fff" />
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            HireHub <span style={{ color: 'var(--color-primary)' }}>AI</span>
          </span>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {role} PORTAL
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <div style={{ padding: '1rem 0.65rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: isActive ? '#e8f3fc' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} />
                <span style={{ fontSize: '0.875rem' }}>{link.label}</span>
              </div>
              {link.badge && (
                <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User profile & Logout footer */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
        background: '#f9fafb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e8f3fc',
              border: '1px solid #c8e1f9',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}>
              {(profile?.fullName || 'U')[0]}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {profile?.fullName || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {role.toLowerCase()}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ color: 'var(--text-muted)', padding: '0.4rem' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
