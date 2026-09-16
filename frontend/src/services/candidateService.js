import api from './api.js';

/**
 * Step 3.5: Candidate API Service
 * Handles Candidate Profiles, Education, Experience, Skills, and Resumes
 */
export const candidateService = {
    // --- Profile Management ---

    /**
     * Get profile of currently authenticated candidate
     * Endpoint: GET /api/v1/candidates/me
     */
    async getMyProfile() {
        const response = await api.get('/candidates/me');
        return response.data;
    },

    /**
     * Get candidate profile by ID
     * Endpoint: GET /api/v1/candidates/{id}
     */
    async getProfileById(id) {
        const response = await api.get(`/candidates/${id}`);
        return response.data;
    },

    /**
     * Get candidate profile by Spring Boot User ID
     * Endpoint: GET /api/v1/candidates/user/{userId}
     */
    async getProfileByUserId(userId) {
        const response = await api.get(`/candidates/user/${userId}`);
        return response.data;
    },

    /**
     * Create candidate profile for authenticated user
     * Endpoint: POST /api/v1/candidates
     * @param {Object} profileData - CandidateProfileRequestDTO
     */
    async createProfile(profileData) {
        const response = await api.post('/candidates', profileData);
        return response.data;
    },

    /**
     * Update currently authenticated candidate's profile
     * Endpoint: PUT /api/v1/candidates/me
     * @param {Object} profileData - CandidateProfileRequestDTO
     */
    async updateMyProfile(profileData) {
        const response = await api.put('/candidates/me', profileData);
        return response.data;
    },

    /**
     * Update candidate profile by ID
     * Endpoint: PUT /api/v1/candidates/{id}
     * @param {string} id - Candidate Profile UUID
     * @param {Object} profileData - CandidateProfileRequestDTO
     */
    async updateProfile(id, profileData) {
        const response = await api.put(`/candidates/${id}`, profileData);
        return response.data;
    },

    // --- Education History ---

    /**
     * Add education record
     * Endpoint: POST /api/v1/candidates/{id}/education
     */
    async addEducation(profileId, educationData) {
        const response = await api.post(`/candidates/${profileId}/education`, educationData);
        return response.data;
    },

    /**
     * Update education record
     * Endpoint: PUT /api/v1/candidates/{id}/education/{educationId}
     */
    async updateEducation(profileId, educationId, educationData) {
        const response = await api.put(`/candidates/${profileId}/education/${educationId}`, educationData);
        return response.data;
    },

    /**
     * Delete education record
     * Endpoint: DELETE /api/v1/candidates/{id}/education/{educationId}
     */
    async deleteEducation(profileId, educationId) {
        const response = await api.delete(`/candidates/${profileId}/education/${educationId}`);
        return response.data;
    },

    // --- Experience History ---

    /**
     * Add experience record
     * Endpoint: POST /api/v1/candidates/{id}/experience
     */
    async addExperience(profileId, experienceData) {
        const response = await api.post(`/candidates/${profileId}/experience`, experienceData);
        return response.data;
    },

    /**
     * Update experience record
     * Endpoint: PUT /api/v1/candidates/{id}/experience/{experienceId}
     */
    async updateExperience(profileId, experienceId, experienceData) {
        const response = await api.put(`/candidates/${profileId}/experience/${experienceId}`, experienceData);
        return response.data;
    },

    /**
     * Delete experience record
     * Endpoint: DELETE /api/v1/candidates/{id}/experience/{experienceId}
     */
    async deleteExperience(profileId, experienceId) {
        const response = await api.delete(`/candidates/${profileId}/experience/${experienceId}`);
        return response.data;
    },

    // --- Candidate Skills ---

    /**
     * Attach skill to candidate profile
     * Endpoint: POST /api/v1/candidates/{id}/skills
     * @param {string} profileId
     * @param {Object} skillData - { skillId, proficiencyLevel, yearsOfExperience }
     */
    async addSkill(profileId, skillData) {
        const response = await api.post(`/candidates/${profileId}/skills`, skillData);
        return response.data;
    },

    /**
     * Detach skill from candidate profile
     * Endpoint: DELETE /api/v1/candidates/{id}/skills/{candidateSkillId}
     */
    async deleteSkill(profileId, candidateSkillId) {
        const response = await api.delete(`/candidates/${profileId}/skills/${candidateSkillId}`);
        return response.data;
    },

    // --- Resume Management ---

    /**
     * Register uploaded resume metadata with candidate profile
     * Endpoint: POST /api/v1/candidates/{id}/resumes
     * @param {string} profileId
     * @param {Object} resumeData - { fileName, fileUrl, fileType, fileSize, isPrimary, atsScore }
     */
    async addResume(profileId, resumeData) {
        const response = await api.post(`/candidates/${profileId}/resumes`, resumeData);
        return response.data;
    },

    /**
     * Delete resume record
     * Endpoint: DELETE /api/v1/candidates/{id}/resumes/{resumeId}
     */
    async deleteResume(profileId, resumeId) {
        const response = await api.delete(`/candidates/${profileId}/resumes/${resumeId}`);
        return response.data;
    },

    // --- Certifications Management ---

    /**
     * Add certification record
     */
    async addCertification(profileId, certData) {
        try {
            const response = await api.post(`/candidates/${profileId}/certifications`, certData);
            return response.data;
        } catch {
            // Fallback for demonstration/offline
            return { id: 'cert-' + Date.now(), ...certData, createdAt: new Date().toISOString() };
        }
    },

    /**
     * Delete certification record
     */
    async deleteCertification(profileId, certId) {
        try {
            const response = await api.delete(`/candidates/${profileId}/certifications/${certId}`);
            return response.data;
        } catch {
            return { success: true };
        }
    },

    // --- Global Skills Catalog ---

    /**
     * Search skills or get all available skills
     * Endpoint: GET /api/v1/skills?search=...
     */
    async getSkills(search) {
        const response = await api.get('/skills', {
            params: search ? { search } : {},
        });
        return response.data;
    },

    /**
     * Get skills categorized
     * Endpoint: GET /api/v1/skills/category/{category}
     */
    async getSkillsByCategory(category) {
        const response = await api.get(`/skills/category/${encodeURIComponent(category)}`);
        return response.data;
    },

    /**
     * Create a new skill in catalog
     * Endpoint: POST /api/v1/skills
     */
    async createSkill(skillData) {
        const response = await api.post('/skills', skillData);
        return response.data;
    },

    /**
     * Option B: AI Resume Auto-Parser (3-Second Profile Auto-fill)
     * Endpoint: POST /api/v1/resumes/parse-autofill
     */
    async parseAndAutofillResume(file, rawText = '') {
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        if (rawText) {
            formData.append('rawText', rawText);
        }
        const response = await api.post('/resumes/parse-autofill', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default candidateService;
