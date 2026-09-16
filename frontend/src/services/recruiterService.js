import api from './api.js';

/**
 * Step 3.6: Recruiter & Company API Service
 * Handles Recruiter Profiles, Company Associations, and Company Directory
 */
export const recruiterService = {
    // --- Recruiter Profile Management ---

    /**
     * Get profile of currently authenticated recruiter
     * Endpoint: GET /api/v1/recruiters/me
     */
    async getMyProfile() {
        const response = await api.get('/recruiters/me');
        return response.data;
    },

    /**
     * Update profile of currently authenticated recruiter
     * Endpoint: PUT /api/v1/recruiters/me
     * @param {Object} profileData - RecruiterProfileRequestDTO
     */
    async updateMyProfile(profileData) {
        const response = await api.put('/recruiters/me', profileData);
        return response.data;
    },

    /**
     * Search/List all candidate profiles
     * Endpoint: GET /api/v1/candidates
     */
    async getAllCandidates() {
        const response = await api.get('/candidates');
        return response.data;
    },

    /**
     * Get recruiter profile by ID
     * Endpoint: GET /api/v1/recruiters/{id}
     */
    async getProfileById(id) {
        const response = await api.get(`/recruiters/${id}`);
        return response.data;
    },

    /**
     * Get recruiter profile by Spring Boot User ID
     * Endpoint: GET /api/v1/recruiters/user/{userId}
     */
    async getProfileByUserId(userId) {
        const response = await api.get(`/recruiters/user/${userId}`);
        return response.data;
    },

    /**
     * Get all recruiters belonging to a company
     * Endpoint: GET /api/v1/recruiters/company/{companyId}
     */
    async getRecruitersByCompany(companyId) {
        const response = await api.get(`/recruiters/company/${companyId}`);
        return response.data;
    },

    /**
     * Create recruiter profile for authenticated user
     * Endpoint: POST /api/v1/recruiters
     * @param {Object} profileData - RecruiterProfileRequestDTO
     */
    async createProfile(profileData) {
        const response = await api.post('/recruiters', profileData);
        return response.data;
    },

    /**
     * Update recruiter profile by ID
     * Endpoint: PUT /api/v1/recruiters/{id}
     * @param {string} id - Recruiter Profile UUID
     * @param {Object} profileData - RecruiterProfileRequestDTO
     */
    async updateProfile(id, profileData) {
        const response = await api.put(`/recruiters/${id}`, profileData);
        return response.data;
    },

    /**
     * Associate recruiter profile with a company
     * Endpoint: POST /api/v1/recruiters/{id}/company/{companyId}
     */
    async joinCompany(id, companyId) {
        const response = await api.post(`/recruiters/${id}/company/${companyId}`);
        return response.data;
    },

    /**
     * Remove company association from recruiter profile
     * Endpoint: DELETE /api/v1/recruiters/{id}/company
     */
    async leaveCompany(id) {
        const response = await api.delete(`/recruiters/${id}/company`);
        return response.data;
    },

    // --- Company Directory & Management ---

    /**
     * Search companies or list all
     * Endpoint: GET /api/v1/companies?search=...
     */
    async getAllCompanies(search) {
        const response = await api.get('/companies', {
            params: search ? { search } : {},
        });
        return response.data;
    },

    /**
     * Get verified companies
     * Endpoint: GET /api/v1/companies/verified
     */
    async getVerifiedCompanies() {
        const response = await api.get('/companies/verified');
        return response.data;
    },

    /**
     * Get companies filtered by industry
     * Endpoint: GET /api/v1/companies/industry/{industry}
     */
    async getCompaniesByIndustry(industry) {
        const response = await api.get(`/companies/industry/${encodeURIComponent(industry)}`);
        return response.data;
    },

    /**
     * Get single company details by ID
     * Endpoint: GET /api/v1/companies/{id}
     */
    async getCompanyById(id) {
        const response = await api.get(`/companies/${id}`);
        return response.data;
    },

    /**
     * Create a new company record
     * Endpoint: POST /api/v1/companies
     * @param {Object} companyData - CompanyRequestDTO
     */
    async createCompany(companyData) {
        const response = await api.post('/companies', companyData);
        return response.data;
    },

    /**
     * Update an existing company
     * Endpoint: PUT /api/v1/companies/{id}
     */
    async updateCompany(id, companyData) {
        const response = await api.put(`/companies/${id}`, companyData);
        return response.data;
    },

    /**
     * Verify company profile (Admin / Platform verification)
     * Endpoint: PATCH /api/v1/companies/{id}/verify
     */
    async verifyCompany(id) {
        const response = await api.patch(`/companies/${id}/verify`);
        return response.data;
    },

    /**
     * Delete company by ID
     * Endpoint: DELETE /api/v1/companies/{id}
     */
    async deleteCompany(id) {
        const response = await api.delete(`/companies/${id}`);
        return response.data;
    },
};

export default recruiterService;
