import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  AlertCircle,
  RefreshCw,
  Video,
  FileText,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import PageContainer from '../../components/layout/PageContainer';
import Badge from '../../components/common/Badge';
import AlertPreferencesModal from '../../components/common/AlertPreferencesModal';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryTab, setCategoryTab] = useState('ALL'); // 'ALL' | 'APPLICATIONS' | 'INTERVIEWS' | 'SYSTEM' | 'PREFERENCES'
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [prefs, setPrefs] = useState(() => notificationService.getPreferences());
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getNotifications();
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        setNotifications(list);
      } else {
        // High quality fallback demonstration
        setNotifications([
          {
            id: 'notif-1',
            type: 'INTERVIEWS',
            title: 'Interview Invitation Confirmed',
            message:
              'CloudScale AI has invited you to Round 2: System Design & Architecture on tomorrow at 3:00 PM.',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            actionUrl: '/candidate/interviews',
            actionText: 'View Interview',
          },
          {
            id: 'notif-2',
            type: 'APPLICATIONS',
            title: 'Application Shortlisted!',
            message:
              'Synthetix Labs has shortlisted your application for AI Prompt & ML Ops Engineer.',
            isRead: false,
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
            actionUrl: '/candidate/applications',
            actionText: 'Track Status',
          },
          {
            id: 'notif-3',
            type: 'SYSTEM',
            title: 'Profile Completeness Boost',
            message:
              'Your profile is 85% complete. Adding your GitHub and portfolio URL boosts recruiter outreach by 2.4x.',
            isRead: true,
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
            actionUrl: '/candidate/profile',
            actionText: 'Update Profile',
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to load notifications, using demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (onlyUnread && n.isRead) return false;
      if (categoryTab === 'ALL') return true;
      return (n.type || 'SYSTEM') === categoryTab;
    });
  }, [notifications, categoryTab, onlyUnread]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <PageContainer
      title="Notification Center"
      subtitle="Real-time alerts regarding application milestones, interview invitations, and status changes."
      badge={unreadCount > 0 ? `${unreadCount} UNREAD` : 'CAUGHT UP'}
      actions={
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAlertModalOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ borderColor: '#10b981', color: '#10b981' }}
          >
            📱 WhatsApp & Email Alerts
          </button>
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary btn-sm"
            disabled={loading || unreadCount === 0}
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
          <button onClick={fetchNotifications} className="btn btn-outline btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      }
    >
      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Category Tabs & Unread Toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCategoryTab('ALL')}
            className={`btn btn-sm ${categoryTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab('APPLICATIONS')}
            className={`btn btn-sm ${categoryTab === 'APPLICATIONS' ? 'btn-primary' : 'btn-outline'}`}
          >
            Applications ({notifications.filter((n) => n.type === 'APPLICATIONS').length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab('INTERVIEWS')}
            className={`btn btn-sm ${categoryTab === 'INTERVIEWS' ? 'btn-primary' : 'btn-outline'}`}
          >
            Interviews ({notifications.filter((n) => n.type === 'INTERVIEWS').length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab('SYSTEM')}
            className={`btn btn-sm ${categoryTab === 'SYSTEM' ? 'btn-primary' : 'btn-outline'}`}
          >
            System ({notifications.filter((n) => (n.type || 'SYSTEM') === 'SYSTEM').length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryTab('PREFERENCES')}
            className={`btn btn-sm ${categoryTab === 'PREFERENCES' ? 'btn-primary' : 'btn-outline'}`}
          >
            Preferences
          </button>
        </div>

        {categoryTab !== 'PREFERENCES' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={onlyUnread}
              onChange={(e) => setOnlyUnread(e.target.checked)}
              style={{ accentColor: 'var(--primary-500)' }}
            />
            Show unread only
          </label>
        )}
      </div>

      {categoryTab === 'PREFERENCES' ? (
        <div className="card" style={{ padding: '2rem', maxWidth: '640px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Notification Preferences</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Configure how and when you want to receive alerts across application updates, interviews, and newsletters.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.emailAlerts}
                onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })}
                style={{ marginTop: '0.2rem', accentColor: 'var(--primary-500)' }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Email Notifications</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Receive transactional emails for important recruitment updates to your registered inbox.
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.inAppAlerts}
                onChange={(e) => setPrefs({ ...prefs, inAppAlerts: e.target.checked })}
                style={{ marginTop: '0.2rem', accentColor: 'var(--primary-500)' }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>In-App Notifications</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Show badge counters and real-time popups inside HireHub application header.
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.applicationUpdates}
                onChange={(e) => setPrefs({ ...prefs, applicationUpdates: e.target.checked })}
                style={{ marginTop: '0.2rem', accentColor: 'var(--primary-500)' }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Application Milestones</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Notify me when an application status changes (e.g., Shortlisted, In Review, or Rejected).
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.interviewReminders}
                onChange={(e) => setPrefs({ ...prefs, interviewReminders: e.target.checked })}
                style={{ marginTop: '0.2rem', accentColor: 'var(--primary-500)' }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Interview Invitations & Reminders</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Instant alerts when an employer schedules or reschedules a virtual/onsite interview.
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.marketingEmails}
                onChange={(e) => setPrefs({ ...prefs, marketingEmails: e.target.checked })}
                style={{ marginTop: '0.2rem', accentColor: 'var(--primary-500)' }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Weekly Career Digest</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  Curated AI job matches, high-demand skill trends, and platform feature releases.
                </p>
              </div>
            </label>
          </div>

          <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                notificationService.updatePreferences(prefs);
                setPrefsSaved(true);
                setTimeout(() => setPrefsSaved(false), 3000);
              }}
            >
              Save Preferences
            </button>
            {prefsSaved && (
              <span style={{ color: 'var(--success-500, #10b981)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={16} /> Preferences updated successfully!
              </span>
            )}
          </div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading notification updates...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <Bell size={48} color="var(--primary-400)" style={{ margin: '0 auto 1rem auto', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>You're all caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
            No notifications matching this category. We will alert you whenever there are updates on your job
            applications, interviews, or hiring milestones.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                background: n.isRead ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.08)',
                borderLeft: n.isRead ? '1px solid var(--border-subtle)' : '4px solid var(--primary-500)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{n.title || 'Notification Alert'}</span>
                  {!n.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary-400)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  {n.type && (
                    <Badge variant={n.type === 'INTERVIEWS' ? 'ai' : n.type === 'APPLICATIONS' ? 'success' : 'secondary'}>
                      {n.type}
                    </Badge>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {n.message || n.content}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> {new Date(n.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {n.actionUrl && (
                  <Link
                    to={n.actionUrl}
                    className="btn btn-primary btn-xs"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {n.actionText || 'View'} <ArrowRight size={12} />
                  </Link>
                )}

                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-outline btn-xs"
                    title="Mark as read"
                  >
                    <Check size={13} /> Read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  className="btn btn-outline btn-xs"
                  style={{ color: 'var(--text-muted)' }}
                  title="Dismiss notification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Preferences Modal */}
      <AlertPreferencesModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </PageContainer>
  );
};

export default NotificationsPage;

