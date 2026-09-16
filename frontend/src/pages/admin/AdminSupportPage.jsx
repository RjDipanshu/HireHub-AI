import React, { useState, useEffect } from 'react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminSupportService from '../../services/adminSupportService';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  X
} from 'lucide-react';

export const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Selected Ticket State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority, filterCategory]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSupportService.getAdminTickets({
        status: filterStatus,
        priority: filterPriority,
        category: filterCategory,
        search: searchTerm
      });
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError('Unable to load support tickets from the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setLoadingMessages(true);
    try {
      const msgs = await adminSupportService.getAdminTicketMessages(ticket.ticketId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleClosePanel = () => {
    setSelectedTicket(null);
    setMessages([]);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    try {
      const newMessage = await adminSupportService.addAdminTicketMessage(selectedTicket.ticketId, replyText);
      setMessages([...messages, newMessage]);
      setReplyText('');
      
      // Auto-update ticket status in list if it was waiting
      if (selectedTicket.status === 'OPEN' || selectedTicket.status === 'IN_PROGRESS') {
        const updatedTicket = { ...selectedTicket, status: 'WAITING_FOR_USER' };
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map(t => t.ticketId === updatedTicket.ticketId ? updatedTicket : t));
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket || newStatus === selectedTicket.status) return;
    setUpdatingStatus(true);
    try {
      const updated = await adminSupportService.updateTicketStatus(selectedTicket.ticketId, newStatus);
      setSelectedTicket(updated);
      setTickets(tickets.map(t => t.ticketId === updated.ticketId ? updated : t));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const handleUpdatePriority = async (newPriority) => {
    if (!selectedTicket || newPriority === selectedTicket.priority) return;
    try {
      const updated = await adminSupportService.updateTicketPriority(selectedTicket.ticketId, newPriority);
      setSelectedTicket(updated);
      setTickets(tickets.map(t => t.ticketId === updated.ticketId ? updated : t));
    } catch (err) {
      console.error('Failed to update priority:', err);
      alert('Failed to update priority.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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
    <div style={{ display: 'flex', height: '100%', gap: '1.5rem', overflow: 'hidden' }}>
      {/* Main List Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s ease' }}>
        
        {/* Header & Controls */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LifeBuoy size={24} color="var(--color-primary)" />
                Support Tickets
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage user inquiries, bug reports, and assistance requests.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 300px', display: 'flex', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Search size={18} />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Search by ticket ID, subject, or user email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.75rem', width: '100%' }}
              />
              <button type="submit" style={{ display: 'none' }}>Search</button>
            </form>

            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_USER">Waiting for User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              className="form-control"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <LoadingSpinner label="Loading tickets..." />
            </div>
          ) : error ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <AlertCircle size={40} color="var(--danger, #cc1016)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <LifeBuoy size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No tickets found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No support tickets match your current filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-subtle)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ticket ID</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Subject & User</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Priority</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Created</th>
                    <th style={{ padding: '1rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.ticketId}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: selectedTicket?.ticketId === ticket.ticketId ? 'var(--color-primary-light)' : 'transparent',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewTicket(ticket)}
                      className="hover-bg-light"
                    >
                      <td style={{ padding: '1rem', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {ticket.ticketId}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                          {ticket.subject}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {ticket.userName || 'Unknown'} ({ticket.userEmail || 'No Email'})
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {ticket.category}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Badge variant={getPriorityVariant(ticket.priority)} size="sm">{ticket.priority}</Badge>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Badge variant={getStatusVariant(ticket.status)} size="sm">{ticket.status}</Badge>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-outline btn-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Side Panel */}
      {selectedTicket && (
        <div 
          className="card shadow-lg" 
          style={{ 
            width: '450px', 
            flexShrink: 0, 
            display: 'flex', 
            flexDirection: 'column',
            borderLeft: '1px solid var(--border-subtle)',
            animation: 'slideInRight 0.3s ease',
            position: 'relative'
          }}
        >
          {/* Panel Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{selectedTicket.ticketId}</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Ticket Details</h2>
            </div>
            <button 
              onClick={handleClosePanel}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '50%' }}
              className="hover-bg-light"
            >
              <X size={20} />
            </button>
          </div>

          {/* Panel Body - Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Quick Actions / Status Updates */}
            <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Update Status</label>
                <select 
                  className="form-control" 
                  value={selectedTicket.status} 
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updatingStatus}
                  style={{ padding: '0.4rem 0.5rem', fontSize: '0.85rem' }}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING_FOR_USER">Waiting for User</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Update Priority</label>
                <select 
                  className="form-control" 
                  value={selectedTicket.priority} 
                  onChange={(e) => handleUpdatePriority(e.target.value)}
                  style={{ padding: '0.4rem 0.5rem', fontSize: '0.85rem' }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Original Issue */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                {selectedTicket.subject}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>From: <strong>{selectedTicket.userName || 'Unknown'}</strong></span>
                <span>•</span>
                <span>{formatDate(selectedTicket.createdAt)}</span>
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-primary)', 
                lineHeight: 1.6, 
                whiteSpace: 'pre-wrap', 
                background: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                {selectedTicket.description}
              </div>
            </div>

            {/* Conversation Thread */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                Conversation
              </h4>
              
              {loadingMessages ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <LoadingSpinner size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No replies yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((msg) => {
                    const isAdmin = msg.senderType === 'SUPPORT' || msg.senderType === 'SYSTEM';
                    return (
                      <div 
                        key={msg.id} 
                        style={{ 
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isAdmin ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: isAdmin ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                            {isAdmin ? 'Support Team' : msg.senderName || 'User'}
                          </span>
                          <span>{formatDate(msg.createdAt)}</span>
                        </div>
                        <div style={{ 
                          background: isAdmin ? 'var(--color-primary)' : '#f1f5f9',
                          color: isAdmin ? '#ffffff' : 'var(--text-primary)',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          borderTopRightRadius: isAdmin ? '4px' : '12px',
                          borderTopLeftRadius: !isAdmin ? '4px' : '12px',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Reply Box Footer */}
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle)', background: '#ffffff' }}>
            {selectedTicket.status === 'CLOSED' || selectedTicket.status === 'RESOLVED' ? (
              <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem', color: 'var(--success)' }} />
                This ticket is {selectedTicket.status.toLowerCase()}. Replies are disabled.
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-control"
                  placeholder="Type your reply to the user..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ width: '100%', minHeight: '100px', resize: 'none', paddingBottom: '3rem', fontSize: '0.9rem' }}
                  disabled={sendingReply}
                />
                <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem' }}>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {sendingReply ? <LoadingSpinner size={14} color="#fff" /> : <Send size={14} />}
                    Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportPage;
