import React from 'react';
import { CheckCircle2, Ticket, ArrowRight, PlusCircle, Calendar, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export const SupportTicketSuccessCard = ({ ticket, onViewTickets, onCreateAnother }) => {
  if (!ticket) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
      default:
        return 'primary';
    }
  };

  return (
    <div
      className="card"
      style={{
        background: '#ffffff',
        border: '1px solid var(--success-border, #ceead6)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--success-bg, #e6f4ea)',
            color: 'var(--success, #057642)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Support Ticket Created Successfully!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
          We've received your request. Our support team will review it shortly and prioritize it based on urgency.
        </p>
      </div>

      {/* Ticket Reference Highlight Box */}
      <div
        style={{
          background: 'var(--color-primary-light, #e8f3fc)',
          border: '1px solid #c8e1f9',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ticket size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Ticket ID
            </div>
            <div
              id="success-ticket-id"
              style={{
                fontFamily: 'monospace',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              {ticket.ticketId}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge variant={getPriorityVariant(ticket.priority)}>
            {ticket.priority}
          </Badge>
          <Badge variant="ai">
            {ticket.status || 'OPEN'}
          </Badge>
        </div>
      </div>

      {/* Ticket Details Summary */}
      <div
        style={{
          background: '#f9fafb',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Subject:</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ticket.subject}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.category}</span>
        </div>
        {ticket.createdAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Submitted:</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--text-muted)" /> {formatDate(ticket.createdAt)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <button
          type="button"
          id="btn-view-my-tickets"
          className="btn btn-primary"
          onClick={onViewTickets}
          style={{ minWidth: '180px' }}
        >
          <span>View My Tickets</span>
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          id="btn-create-another-ticket"
          className="btn btn-secondary"
          onClick={onCreateAnother}
          style={{ minWidth: '180px' }}
        >
          <PlusCircle size={16} />
          <span>Create Another Ticket</span>
        </button>
      </div>
    </div>
  );
};

export default SupportTicketSuccessCard;
