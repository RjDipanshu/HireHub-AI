import React from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../common/Badge';

export const InterviewCard = ({ interview, onReschedule, onCancel }) => {
  if (!interview) return null;

  const {
    id,
    jobTitle = 'Senior Software Engineer',
    candidateName,
    recruiterName,
    scheduledAt,
    meetingLink,
    status = 'SCHEDULED',
    roundName = 'Technical Round',
  } = interview;

  const formattedDate = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBD';

  const formattedTime = scheduledAt
    ? new Date(scheduledAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
            {roundName}
          </span>
          <h4 style={{ fontSize: '1.15rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
            {jobTitle}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {candidateName ? `Candidate: ${candidateName}` : recruiterName ? `Interviewer: ${recruiterName}` : ''}
          </p>
        </div>

        <Badge variant={status === 'COMPLETED' ? 'success' : status === 'CANCELLED' ? 'danger' : 'primary'}>
          {status}
        </Badge>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '0.75rem',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <Calendar size={15} color="var(--primary-400)" /> {formattedDate}
        </div>
        {formattedTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Clock size={15} color="var(--primary-400)" /> {formattedTime}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '0.5rem' }}>
        {meetingLink ? (
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Video size={14} /> Join Meeting
          </a>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meeting link will be provided</span>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onReschedule && status === 'SCHEDULED' && (
            <button onClick={() => onReschedule(id)} className="btn btn-outline btn-sm">
              Reschedule
            </button>
          )}
          {onCancel && status === 'SCHEDULED' && (
            <button onClick={() => onCancel(id)} className="btn btn-danger btn-sm">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
