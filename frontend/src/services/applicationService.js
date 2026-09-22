import api from './api.js';

/**
 * Step 3.8: Application API Service
 * Handles Job Applications, Candidate Submissions, and Recruiter Review Pipelines
 */
export const applicationService = {
    // --- Candidate Endpoints ---

    /**
     * Submit a new job application
     * Endpoint: POST /api/v1/applications
     * @param {Object} applicationData - { jobId: string, resumeId?: string, coverLetter?: string }
     */
    async applyForJob(applicationData) {
        const response = await api.post('/applications', applicationData);
        return response.data;
    },

    /**
     * Track external ATS job application redirection (Section 12 Architecture)
     * Endpoint: POST /api/v1/jobs/{jobId}/apply-external
     * @param {string} jobId - Job UUID
     */
    async applyExternalJob(jobId) {
        const response = await api.post(`/jobs/${jobId}/apply-external`);
        return response.data;
    },

    /**
     * Get all applications submitted by the current candidate
     * Endpoint: GET /api/v1/applications/me
     */
    async getMyApplications() {
        const response = await api.get('/applications/me');
        return response.data;
    },

    /**
     * Get specific application details by ID
     * Endpoint: GET /api/v1/applications/{id}
     * @param {string} id - Application UUID
     */
    async getApplicationById(id) {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    },

    /**
     * Candidate withdraws an application
     * Endpoint: DELETE /api/v1/applications/{id}
     * @param {string} id - Application UUID
     */
    async withdrawApplication(id) {
        const response = await api.delete(`/applications/${id}`);
        return response.data;
    },

    // --- Recruiter Review Endpoints ---

    /**
     * Get all applications across all jobs managed by current recruiter/company
     * Endpoint: GET /api/v1/applications/recruiter
     */
    async getRecruiterApplications() {
        const response = await api.get('/applications/recruiter');
        return response.data;
    },

    /**
     * Get all candidate applications for a specific job
     * Endpoint: GET /api/v1/applications/job/{jobId}
     * @param {string} jobId - Job UUID
     */
    async getApplicationsByJob(jobId) {
        const response = await api.get(`/applications/job/${jobId}`);
        return response.data;
    },

    /**
     * Update application status (shortlist, reject, hire, etc.)
     * Endpoint: PATCH /api/v1/applications/{id}/status
     * @param {string} id - Application UUID
     * @param {Object} statusData - { status: string, feedback?: string, rejectionReason?: string }
     */
    async updateApplicationStatus(id, statusData) {
        const response = await api.patch(`/applications/${id}/status`, statusData);
        return response.data;
    },

    /**
     * Mark an application as viewed by recruiter
     * Endpoint: PATCH /api/v1/applications/{id}/viewed
     * @param {string} id - Application UUID
     */
    async markApplicationViewed(id) {
        const response = await api.patch(`/applications/${id}/viewed`);
        return response.data;
    },
};

export default applicationService;
