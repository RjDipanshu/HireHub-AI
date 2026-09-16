import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, ChevronRight, RefreshCw, AlertCircle, PlusCircle, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

export const SupportTicketList = ({
  tickets = [],
  isLoading = false,
  error = null,
  onRefresh,
  onCreateTicketClick,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'ai';
      case 'WAITING_FOR_USER':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'primary';
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

  if (isLoading) {
    return (
      <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <LoadingSpinner label="Fetching your support tickets..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={36} color="var(--danger, #cc1016)" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Unable to Load Support Tickets
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {error}
        </p>
        {onRefresh && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRefresh}>
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="card" style={{ padding: '2.5rem 1.5rem' }}>
        <EmptyState
          icon={Ticket}
          title="No support tickets yet"
          description="You haven't contacted our support team yet. If you need help, create a ticket and we'll get back to you."
          action={
            onCreateTicketClick && (
              <button
                type="button"
                id="btn-empty-create-ticket"
                className="btn btn-primary btn-sm"
                onClick={onCreateTicketClick}
              >
                <PlusCircle size={15} />
                <span>Create Support Ticket</span>
              </button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* List Header / Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Showing {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </div>
        {onRefresh && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onRefresh}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Ticket Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tickets.map((ticket) => (
          <Link
            key={ticket.ticketId}
            to={`/support/tickets/${ticket.ticketId}`}
            className="card card-interactive"
            style={{
              padding: '1.25rem 1.5rem',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-light, #e8f3fc)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {ticket.ticketId}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {ticket.category}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant={getPriorityVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge variant={getStatusVariant(ticket.status)}>
                  {ticket.status || 'OPEN'}
                </Badge>
              </div>
            </div>

            {/* Subject */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {ticket.subject}
              </h3>
              <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </div>

            {/* Footer / Timestamps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} /> Created {formatDate(ticket.createdAt)}
              </span>
              {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> Updated {formatDate(ticket.updatedAt)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SupportTicketList;
