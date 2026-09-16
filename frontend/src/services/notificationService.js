import api from './api.js';

/**
 * Step 3.10: Notification API Service
 * Handles User Alerts, Unread Counters, and Read Acknowledgements
 */
export const notificationService = {
    /**
     * Get all notifications for current authenticated user
     * Endpoint: GET /api/v1/notifications
     */
    async getNotifications() {
        const response = await api.get('/notifications');
        return response.data;
    },

    /**
     * Get count of unread notifications
     * Endpoint: GET /api/v1/notifications/unread-count
     * Returns: number (extracted from { unreadCount: N })
     */
    async getUnreadCount() {
        const response = await api.get('/notifications/unread-count');
        return response.data?.unreadCount ?? 0;
    },

    /**
     * Mark a single notification as read
     * Endpoint: PATCH /api/v1/notifications/{id}/read
     * @param {string} id - Notification UUID
     */
    async markAsRead(id) {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read for current user
     * Endpoint: PATCH /api/v1/notifications/read-all
     */
    async markAllAsRead() {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    /**
     * Broadcast a system notification to all users or filtered by role (Admin only)
     * Endpoint: POST /api/v1/notifications/broadcast
     * @param {Object} payload - { title, message, type, targetRole }
     */
    async broadcastNotification(payload) {
        const response = await api.post('/notifications/broadcast', payload);
        return response.data;
    },

    /**
     * Get user notification preferences
     */
    getPreferences() {
        try {
            const saved = localStorage.getItem('hirehub_notification_prefs');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load notification preferences:', e);
        }
        return {
            emailAlerts: true,
            inAppAlerts: true,
            applicationUpdates: true,
            interviewReminders: true,
            marketingEmails: false,
        };
    },

    /**
     * Update user notification preferences
     */
    updatePreferences(prefs) {
        try {
            localStorage.setItem('hirehub_notification_prefs', JSON.stringify(prefs));
        } catch (e) {
            console.error('Failed to save notification preferences:', e);
        }
        return prefs;
    },
};

export default notificationService;
