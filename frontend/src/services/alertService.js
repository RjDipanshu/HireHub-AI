import api from './api';

export const alertService = {
    // Dispatch WhatsApp template alert
    async sendWhatsAppAlert(data) {
        try {
            const response = await api.post('/alerts/whatsapp', data);
            return response.data;
        } catch (error) {
            console.warn('[AlertService] Fallback to simulated WhatsApp dispatch:', error.message);
            return {
                provider: 'Twilio WhatsApp Business API (Simulated)',
                recipientPhone: data.phoneNumber || '+919876543210',
                status: 'DELIVERED',
                whatsappMessageId: 'WA-DEMO-' + Date.now(),
                messageBody: `📱 HireHub AI WhatsApp Alert: Hello ${data.candidateName || 'Applicant'}! Your application status for ${data.jobTitle || 'Role'} at ${data.companyName || 'HireHub'} is updated to ${data.status || 'SHORTLISTED'}.`
            };
        }
    },

    // Dispatch Transactional Email
    async sendEmailAlert(data) {
        try {
            const response = await api.get('/alerts/email', data);
            return response.data;
        } catch (error) {
            console.warn('[AlertService] Fallback to simulated Email dispatch:', error.message);
            return {
                provider: 'SendGrid / Resend Transactional Email (Simulated)',
                recipientEmail: data.email || 'candidate@hirehub.ai',
                subject: data.subject || 'Application Status Update',
                status: 'SENT',
                emailId: 'EM-DEMO-' + Date.now()
            };
        }
    },

    // Get Notification Alert Preferences
    async getPreferences() {
        try {
            const response = await api.get('/alerts/preferences');
            return response.data;
        } catch (error) {
            return {
                whatsappAlertsEnabled: true,
                emailAlertsEnabled: true,
                smsAlertsEnabled: true,
                interviewRemindersEnabled: true
            };
        }
    }
};

export default alertService;
