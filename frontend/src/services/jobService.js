import api from './api.js';

/**
 * Step 3.7: Job API Service
 * Handles Job Postings, Search & Filtering, Recruiter Job Management, and Candidate Bookmarks
 */
export const jobService = {
    // --- Public / Candidate Search & Discovery ---

    /**
     * Search and filter jobs with pagination
     * Endpoint: GET /api/v1/jobs
     * @param {Object} [params]
     * @param {string} [params.keyword]
     * @param {string} [params.location]
     * @param {string} [params.workMode] - 'REMOTE', 'HYBRID', 'ONSITE'
     * @param {string} [params.employmentType] - 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'
     * @param {string} [params.experienceLevel] - 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'LEAD', 'EXECUTIVE'
     * @param {number} [params.minSalary]
     * @param {number} [params.maxSalary]
     * @param {string} [params.status] - 'ACTIVE', 'PAUSED', 'CLOSED'
     * @param {number} [params.page=0]
     * @param {number} [params.size=10]
     * @param {string} [params.sort='createdAt,desc']
     */
    async searchJobs(params = {}) {
        const response = await api.get('/jobs', {
            params,
            skipAuth: false,
        });
        return response.data;
    },

    /**
     * Get detailed job information by ID
     * Endpoint: GET /api/v1/jobs/{id}
     * @param {string} id - Job UUID
     */
    async getJobById(id) {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    // --- Recruiter Job Management ---

    /**
     * Create a new job posting
     * Endpoint: POST /api/v1/jobs
     * @param {Object} jobData - JobRequestDTO
     */
    async createJob(jobData) {
        const response = await api.post('/jobs', jobData);
        return response.data;
    },

    /**
     * Update an existing job posting
     * Endpoint: PUT /api/v1/jobs/{id}
     * @param {string} id - Job UUID
     * @param {Object} jobData - JobRequestDTO
     */
    async updateJob(id, jobData) {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data;
    },

    /**
     * Update job publication status
     * Endpoint: PATCH /api/v1/jobs/{id}/status?status=...
     * @param {string} id - Job UUID
     * @param {string} status - 'ACTIVE' | 'PAUSED' | 'CLOSED'
     */
    async updateJobStatus(id, status) {
        const response = await api.patch(`/jobs/${id}/status`, null, {
            params: { status },
        });
        return response.data;
    },

    /**
     * Delete a job posting
     * Endpoint: DELETE /api/v1/jobs/{id}
     * @param {string} id - Job UUID
     */
    async deleteJob(id) {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    /**
     * Admin: Get all jobs across all platform employers for moderation
     * Endpoint: GET /api/v1/jobs/admin/all
     */
    async getAllJobsAdmin() {
        const response = await api.get('/jobs/admin/all');
        return response.data;
    },

    /**
     * Admin: Moderate job status (APPROVE -> ACTIVE, REJECT -> CLOSED, PAUSE -> PAUSED)
     * Endpoint: PATCH /api/v1/jobs/{id}/moderate?status=...
     */
    async moderateJob(id, status) {
        const response = await api.patch(`/jobs/${id}/moderate`, null, {
            params: { status },
        });
        return response.data;
    },

    /**
     * Get all jobs created by the authenticated recruiter
     * Endpoint: GET /api/v1/jobs/recruiter/my-jobs
     */
    async getMyJobs() {
        const response = await api.get('/jobs/recruiter/my-jobs');
        return response.data;
    },

    /**
     * Get all jobs associated with a company
     * Endpoint: GET /api/v1/jobs/company/{companyId}
     * @param {string} companyId - Company UUID
     */
    async getJobsByCompany(companyId) {
        const response = await api.get(`/jobs/company/${companyId}`);
        return response.data;
    },

    // --- Saved Jobs (Candidate Bookmarks) ---

    /**
     * Bookmark / Save a job for current candidate
     * Endpoint: POST /api/v1/jobs/{id}/save
     * @param {string} jobId - Job UUID
     */
    async saveJob(jobId) {
        const response = await api.post(`/jobs/${jobId}/save`);
        return response.data;
    },

    /**
     * Remove job from candidate's saved list
     * Endpoint: DELETE /api/v1/jobs/{id}/save
     * @param {string} jobId - Job UUID
     */
    async unsaveJob(jobId) {
        const response = await api.delete(`/jobs/${jobId}/save`);
        return response.data;
    },

    /**
     * Get candidate's saved / bookmarked jobs
     * Endpoint: GET /api/v1/jobs/saved
     */
    async getMySavedJobs() {
        const response = await api.get('/jobs/saved');
        return response.data;
    },
};

export default jobService;
