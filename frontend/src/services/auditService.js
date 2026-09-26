import api from './api';

/**
 * Audit Log Service
 * Manages admin audit trails, query filtering, and event recording.
 */
export const auditService = {
  /**
   * Query enterprise audit logs (Admin only)
   * @param {Object} params - { action, entityType, status, search, startDate, endDate, page, size }
   */
  async getAuditLogs(params = {}) {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },

  /**
   * Log an event from client-side security actions (e.g. 2FA, data export, etc.)
   * @param {Object} eventData - { action, entityType, entityId, details, status }
   */
  async logEvent(eventData) {
    try {
      const response = await api.post('/audit-logs/event', eventData);
      return response.data;
    } catch (err) {
      console.warn('[AuditService] Failed to record audit log event:', err?.message || err);
      return null;
    }
  },
};

export default auditService;
