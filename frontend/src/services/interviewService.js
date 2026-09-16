import api from './api.js';

/**
 * Step 3.9: Interview API Service
 * Handles Interview Scheduling, Lifecycle Actions, and Coordination
 */
export const interviewService = {
    /**
     * Schedule a new interview for a job application
     * Endpoint: POST /api/v1/interviews
     * @param {Object} interviewData - { applicationId: string, scheduledAt: string, durationMinutes?: number, meetingLink?: string, interviewType?: string, recruiterNotes?: string }
     */
    async scheduleInterview(interviewData) {
        const response = await api.post('/interviews', interviewData);
        return response.data;
    },

    /**
     * Get all interviews for current authenticated candidate
     * Endpoint: GET /api/v1/interviews/candidate
     */
    async getCandidateInterviews() {
        const response = await api.get('/interviews/candidate');
        return response.data;
    },

    /**
     * Get all interviews managed by current authenticated recruiter
     * Endpoint: GET /api/v1/interviews/recruiter
     */
    async getRecruiterInterviews() {
        const response = await api.get('/interviews/recruiter');
        return response.data;
    },

    /**
     * Get interview details by ID
     * Endpoint: GET /api/v1/interviews/{id}
     * @param {string} id - Interview UUID
     */
    async getInterviewById(id) {
        const response = await api.get(`/interviews/${id}`);
        return response.data;
    },

    /**
     * Reschedule interview to a new time
     * Endpoint: PATCH /api/v1/interviews/{id}/reschedule?newTime=...&meetingLink=...
     * @param {string} id - Interview UUID
     * @param {string} newTime - ISO 8601 string (e.g. 2026-09-10T14:30:00)
     * @param {string} [meetingLink]
     */
    async rescheduleInterview(id, newTime, meetingLink) {
        const response = await api.patch(`/interviews/${id}/reschedule`, null, {
            params: {
                newTime,
                meetingLink: meetingLink || undefined,
            },
        });
        return response.data;
    },

    /**
     * Cancel an existing interview
     * Endpoint: PATCH /api/v1/interviews/{id}/cancel?reason=...
     * @param {string} id - Interview UUID
     * @param {string} [reason]
     */
    async cancelInterview(id, reason) {
        const response = await api.patch(`/interviews/${id}/cancel`, null, {
            params: {
                reason: reason || undefined,
            },
        });
        return response.data;
    },

    /**
     * Mark interview completed with optional feedback
     * Endpoint: PATCH /api/v1/interviews/{id}/complete?feedback=...
     * @param {string} id - Interview UUID
     * @param {string} [feedback]
     */
    async completeInterview(id, feedback) {
        const response = await api.patch(`/interviews/${id}/complete`, null, {
            params: {
                feedback: feedback || undefined,
            },
        });
        return response.data;
    },
};

export default interviewService;
