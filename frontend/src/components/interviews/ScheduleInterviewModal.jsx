import React, { useState } from 'react';
import { Calendar, Clock, Video, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import interviewService from '../../services/interviewService';

const ROUND_TYPES = [
  { value: 'INITIAL_SCREEN', label: 'Initial Recruiter Screen (30m)' },
  { value: 'TECHNICAL_ROUND', label: 'Technical Assessment / Live Coding (60m)' },
  { value: 'SYSTEM_DESIGN', label: 'Architecture & System Design (60m)' },
  { value: 'HIRING_MANAGER', label: 'Hiring Manager Interview (45m)' },
  { value: 'BEHAVIORAL', label: 'Culture & Behavioral Fit (45m)' },
  { value: 'FINAL_ROUND', label: 'Executive Final Round (30m)' },
];

export const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  application,
  onScheduled,
}) => {
  if (!isOpen) return null;

  const [roundType, setRoundType] = useState('TECHNICAL_ROUND');
  const [scheduledAt, setScheduledAt] = useState(() => {
    // Default tomorrow at 2:00 PM
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6));
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const candidateName =
    application?.candidate?.user
      ? `${application.candidate.user.firstName || ''} ${application.candidate.user.lastName || ''}`.trim()
      : application?.candidateName || 'Candidate';

  const jobTitle = application?.job?.title || application?.jobTitle || 'Open Position';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        applicationId: application.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: parseInt(durationMinutes, 10),
        meetingLink: meetingLink.trim(),
        interviewType: roundType,
        recruiterNotes: recruiterNotes.trim(),
      };

      const result = await interviewService.scheduleInterview(payload);
      if (onScheduled) onScheduled(result);
      onClose();
    } catch (err) {
      console.error('Schedule interview error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-400)',
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Schedule Interview</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              For <strong style={{ color: 'var(--text-primary)' }}>{candidateName}</strong> • {jobTitle}
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.8rem 1rem',
              marginBottom: '1.25rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Interview Round / Stage
            </label>
            <select
              className="input"
              value={roundType}
              onChange={(e) => setRoundType(e.target.value)}
              required
            >
              {ROUND_TYPES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Date & Time *
              </label>
              <input
                type="datetime-local"
                className="input"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Duration
              </label>
              <select
                className="input"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hour)</option>
                <option value={90}>90 minutes (1.5 hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Meeting URL (Google Meet / Zoom / Teams)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                className="input"
                required
                placeholder="https://meet.google.com/abc-defg-hij"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Interviewer & Candidate Notes (Agenda, topics, prerequisites)
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Focus on microservices architecture and system reliability principles..."
              value={recruiterNotes}
              onChange={(e) => setRecruiterNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Calendar size={16} />
              {submitting ? 'Confirming...' : 'Schedule Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
