import api from './api.js';

/**
 * Support Ticket Service for HireHub AI
 * Connects directly to Spring Boot Help & Support endpoints:
 * - POST /api/v1/support/tickets
 * - GET  /api/v1/support/tickets
 * - GET  /api/v1/support/tickets/{ticketId}
 * 
 * Note: JWT Bearer tokens are automatically injected by the Axios request interceptor in api.js.
 */

/**
 * Submits a new support ticket on behalf of the authenticated user.
 * @param {Object} payload
 * @param {string} payload.subject - Brief summary (5-200 chars)
 * @param {string} payload.description - Detailed explanation (10-5000 chars)
 * @param {string} payload.category - Enum: ACCOUNT, LOGIN, PASSWORD, PROFILE, JOBS, APPLICATION, INTERVIEW, PAYMENTS, TECHNICAL, OTHER
 * @param {string} payload.priority - Enum: LOW, MEDIUM, HIGH, URGENT
 * @returns {Promise<Object>} Created ticket object with server-generated ticketId (e.g. HH-2026-000001)
 */
export const createTicket = async (payload) => {
  const sanitizedPayload = {
    subject: payload.subject?.trim(),
    description: payload.description?.trim(),
    category: payload.category,
    priority: payload.priority || 'MEDIUM',
  };

  const response = await api.post('/support/tickets', sanitizedPayload);
  return response.data;
};

/**
 * Fetches all support tickets created by the authenticated user.
 * @returns {Promise<Array<Object>>} List of support tickets ordered newest first
 */
export const getMyTickets = async () => {
  const response = await api.get('/support/tickets');
  return response.data || [];
};

/**
 * Fetches a single support ticket by its public reference ID.
 * Returns 404 if the ticket does not exist or belongs to another user.
 * @param {string} ticketId - Public ticket identifier (e.g. HH-2026-000001)
 * @returns {Promise<Object>} Support ticket details
 */
export const getMyTicket = async (ticketId) => {
  if (!ticketId) {
    throw new Error('Ticket ID is required');
  }
  const response = await api.get(`/support/tickets/${encodeURIComponent(ticketId.trim())}`);
  return response.data;
};

/**
 * Fetches conversation messages for a ticket.
 */
export const getTicketMessages = async (ticketId) => {
  if (!ticketId) throw new Error('Ticket ID is required');
  const response = await api.get(`/support/tickets/${encodeURIComponent(ticketId.trim())}/messages`);
  return response.data || [];
};

/**
 * Adds a new message to a ticket thread.
 */
export const addTicketMessage = async (ticketId, message) => {
  if (!ticketId) throw new Error('Ticket ID is required');
  const response = await api.post(`/support/tickets/${encodeURIComponent(ticketId.trim())}/messages`, {
    message: message?.trim()
  });
  return response.data;
};

const supportService = {
  createTicket,
  getMyTickets,
  getMyTicket,
  getTicketMessages,
  addTicketMessage,
};

export default supportService;
