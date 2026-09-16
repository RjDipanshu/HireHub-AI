import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Shield,
  Send,
  MessageSquare
} from 'lucide-react';
import { getMyTicket, getTicketMessages, addTicketMessage } from '../../services/supportService';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const SupportTicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Conversation state
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTicketDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyTicket(ticketId);
        if (isMounted) {
          setTicket(data);
          fetchMessages();
        }
      } catch (err) {
        console.error('[SupportTicketDetailsPage] Error fetching ticket:', err);
        if (isMounted) {
          if (err.statusCode === 404 || err.isNotFound) {
            setError('Support ticket not found. It may have been closed or does not belong to your account.');
          } else if (err.statusCode === 403 || err.isForbidden) {
            setError("You don't have permission to access this support ticket.");
          } else if (err.statusCode === 401 || err.isUnauthorized) {
            setError('Your session has expired. Please sign in again.');
          } else if (!navigator.onLine || err.message?.includes('Network Error')) {
            setError('Unable to connect to HireHub AI. Please check your connection and try again.');
          } else {
            setError('Something went wrong while retrieving the ticket details. Please try again.');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const msgs = await getTicketMessages(ticketId);
        if (isMounted) setMessages(msgs);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    if (ticketId) {
      fetchTicketDetails();
    }
    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !ticket) return;
    setIsSending(true);
    try {
      const newMsg = await addTicketMessage(ticket.ticketId, replyText);
      setMessages([...messages, newMsg]);
      setReplyText('');
      
      if (ticket.status === 'WAITING_FOR_USER') {
        setTicket({ ...ticket, status: 'IN_PROGRESS' });
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'IN_PROGRESS': return 'ai';
      case 'WAITING_FOR_USER': return 'warning';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'secondary';
      default: return 'primary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': default: return 'primary';
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/support?tab=tickets"
          id="link-back-to-support"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Support Tickets</span>
        </Link>
      </div>

      {isLoading && (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <LoadingSpinner label="Loading ticket details..." />
        </div>
      )}

      {error && !isLoading && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--danger, #cc1016)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Unable to View Ticket
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            {error}
          </p>
          <Link to="/support?tab=tickets" className="btn btn-primary btn-sm">
            <span>Return to Support Center</span>
          </Link>
        </div>
      )}

      {ticket && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--color-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ticket size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Support Ticket
                  </div>
                  <div id="ticket-details-id" style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {ticket.ticketId}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Badge variant={getPriorityVariant(ticket.priority)}>
                  {ticket.priority} Priority
                </Badge>
                <Badge variant={getStatusVariant(ticket.status)}>
                  {ticket.status || 'OPEN'}
                </Badge>
              </div>
            </div>

            <h1 id="ticket-details-subject" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.35 }}>
              {ticket.subject}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>
                <span style={{ fontWeight: 600 }}>Category: </span>
                <span style={{ color: 'var(--text-primary)' }}>{ticket.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} color="var(--text-muted)" />
                <span>Submitted: {formatDate(ticket.createdAt)}</span>
              </div>
              {ticket.updatedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>Last Updated: {formatDate(ticket.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Issue Description
            </h2>
            <div id="ticket-details-description" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f9fafb', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              {ticket.description}
            </div>
          </div>

          {/* Conversation Area */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} />
              Conversation
            </h2>
            
            {isLoadingMessages ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <LoadingSpinner size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                No replies yet. Use the box below to add a message to this ticket.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                {messages.map((msg) => {
                  const isUser = msg.senderType === 'USER';
                  return (
                    <div 
                      key={msg.id} 
                      style={{ 
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: isUser ? 'var(--text-primary)' : 'var(--color-primary)' }}>
                          {isUser ? 'You' : 'HireHub Support'}
                        </span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                      <div style={{ 
                        background: isUser ? 'var(--bg-tertiary)' : 'var(--color-primary-light)',
                        color: isUser ? 'var(--text-primary)' : 'var(--color-primary-dark)',
                        padding: '1rem',
                        borderRadius: '12px',
                        borderTopRightRadius: isUser ? '4px' : '12px',
                        borderTopLeftRadius: !isUser ? '4px' : '12px',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        border: isUser ? '1px solid var(--border-subtle)' : '1px solid #c8e1f9'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reply Box */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              {ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? (
                <div style={{ padding: '1.25rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem', color: 'var(--success)' }} />
                  This ticket has been marked as <strong>{ticket.status.toLowerCase()}</strong>. Replies are disabled. If you need further assistance, please open a new ticket.
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Add a Reply
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Type your message here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ width: '100%', minHeight: '120px', resize: 'vertical', paddingBottom: '3.5rem', fontSize: '0.95rem' }}
                    disabled={isSending}
                  />
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSending}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {isSending ? <LoadingSpinner size={16} color="#fff" /> : <Send size={16} />}
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status & Review Info Box */}
          <div className="card" style={{ padding: '1.5rem', background: 'var(--color-primary-light, #e8f3fc)', border: '1px solid #c8e1f9', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <Shield size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.925rem', marginBottom: '0.25rem' }}>
                Ticket Tracking
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Our operations team tracks your submission under reference <strong>{ticket.ticketId}</strong>. You will receive updates directly in this thread.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketDetailsPage;
