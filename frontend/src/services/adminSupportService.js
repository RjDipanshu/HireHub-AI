import api from './api';

/**
 * Admin Support Ticket Service
 * Connects to /api/v1/admin/support/tickets endpoints
 */
const adminSupportService = {
  
  /**
   * Retrieves all support tickets with optional filters
   */
  getAdminTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.search && filters.search.trim() !== '') params.append('search', filters.search.trim());

    const response = await api.get(`/admin/support/tickets?${params.toString()}`);
    return response.data || [];
  },

  getAdminTicket: async (ticketId) => {
    if (!ticketId) throw new Error('Ticket ID is required');
    const response = await api.get(`/admin/support/tickets/${encodeURIComponent(ticketId.trim())}`);
    return response.data;
  },

  getAdminTicketMessages: async (ticketId) => {
    if (!ticketId) throw new Error('Ticket ID is required');
    const response = await api.get(`/admin/support/tickets/${encodeURIComponent(ticketId.trim())}/messages`);
    return response.data || [];
  },

  addAdminTicketMessage: async (ticketId, message) => {
    if (!ticketId) throw new Error('Ticket ID is required');
    const response = await api.post(`/admin/support/tickets/${encodeURIComponent(ticketId.trim())}/messages`, {
      message: message?.trim()
    });
    return response.data;
  },

  updateTicketStatus: async (ticketId, status) => {
    if (!ticketId || !status) throw new Error('Ticket ID and Status are required');
    const response = await api.patch(`/admin/support/tickets/${encodeURIComponent(ticketId.trim())}/status`, {
      status
    });
    return response.data;
  },

  updateTicketPriority: async (ticketId, priority) => {
    if (!ticketId || !priority) throw new Error('Ticket ID and Priority are required');
    const response = await api.patch(`/admin/support/tickets/${encodeURIComponent(ticketId.trim())}/priority`, {
      priority
    });
    return response.data;
  }
};

export default adminSupportService;
