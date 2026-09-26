import api from './api.js';
import INDIAN_TECH_JOBS from '../data/mockJobs.js';

/**
 * HireHub AI — Unified Job Marketplace API Service
 * Handles fetching from the unified marketplace that combines
 * internal (recruiter-posted) and external (aggregated) job listings.
 */
export const marketplaceService = {

    /**
     * Search the unified marketplace with filters and pagination.
     * Endpoint: GET /api/v1/marketplace/jobs
     *
     * @param {Object} [params]
     * @param {string} [params.keyword] - Search keyword
     * @param {string} [params.location] - Location filter
     * @param {string} [params.workMode] - REMOTE, HYBRID, ONSITE
     * @param {string} [params.employmentType] - FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
     * @param {string} [params.experienceLevel] - ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, LEAD, EXECUTIVE
     * @param {string} [params.sourceType] - INTERNAL, ADZUNA, GREENHOUSE, LEVER, ALL
     * @param {number} [params.page=0]
     * @param {number} [params.size=20]
     */
    async searchJobs(params = {}) {
        const response = await api.get('/marketplace/jobs', { params });
        return response.data;
    },

    /**
     * Get full details for a specific marketplace job.
     * Endpoint: GET /api/v1/marketplace/jobs/{id}
     *
     * @param {string} id - Job UUID
     * @param {string} [sourceType] - Optional source type hint for faster lookup
     */
    async getJobById(id, sourceType = null) {
        try {
            const params = sourceType ? { sourceType } : {};
            const response = await api.get(`/marketplace/jobs/${id}`, { params });
            if (response.data) return response.data;
        } catch (err) {
            console.debug('[MarketplaceService] API getJobById fallback for ID:', id);
        }
        const match = INDIAN_TECH_JOBS.find((j) => String(j.id) === String(id));
        if (match) return match;
        return null;
    },

    /**
     * Get AI-powered personalized job recommendations for the authenticated candidate.
     * Endpoint: GET /api/v1/marketplace/jobs/recommended
     *
     * @param {number} [limit=10] - Max number of recommendations
     */
    async getRecommendedJobs(limit = 10) {
        const response = await api.get('/marketplace/jobs/recommended', {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get marketplace aggregation statistics.
     * Endpoint: GET /api/v1/marketplace/stats
     */
    async getStats() {
        const response = await api.get('/marketplace/stats');
        return response.data;
    },

    /**
     * Get list of active job sources and their health status.
     * Endpoint: GET /api/v1/marketplace/sources
     */
    async getSources() {
        const response = await api.get('/marketplace/sources');
        return response.data;
    },

    // --- Admin Aggregation Management ---

    /**
     * Trigger a manual aggregation sync (admin only).
     * Endpoint: POST /api/v1/admin/aggregator/sync
     *
     * @param {string} [sourceType] - Optional: sync only a specific source
     */
    async triggerSync(sourceType = null) {
        const params = sourceType ? { sourceType } : {};
        const response = await api.post('/admin/aggregator/sync', null, { params });
        return response.data;
    },

    /**
     * Get sync operation history logs (admin only).
     * Endpoint: GET /api/v1/admin/aggregator/logs
     *
     * @param {number} [page=0]
     * @param {number} [size=20]
     */
    async getSyncLogs(page = 0, size = 20) {
        const response = await api.get('/admin/aggregator/logs', {
            params: { page, size },
        });
        return response.data;
    },

    /**
     * Toggle a job source on/off (admin only).
     * Endpoint: PATCH /api/v1/admin/aggregator/sources/{id}/toggle
     *
     * @param {string} sourceId - JobSource UUID
     */
    async toggleSource(sourceId) {
        const response = await api.patch(`/admin/aggregator/sources/${sourceId}/toggle`);
        return response.data;
    },

    /**
     * Get detailed aggregation stats (admin only).
     * Endpoint: GET /api/v1/admin/aggregator/stats
     */
    async getAggregatorStats() {
        const response = await api.get('/admin/aggregator/stats');
        return response.data;
    },
};

export default marketplaceService;
