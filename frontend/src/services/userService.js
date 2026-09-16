import api from './api.js';

/**
 * Admin User Management API Service
 * Handles user listing, role assignments, account status toggles, and deletion
 */
export const userService = {
    /**
     * Get all platform users (Admin only)
     * Endpoint: GET /api/v1/users
     */
    async getAllUsers() {
        const response = await api.get('/users');
        return response.data;
    },

    /**
     * Get user by ID
     * Endpoint: GET /api/v1/users/{id}
     */
    async getUserById(id) {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Get detailed user info
     * Endpoint: GET /api/v1/users/{id}/details
     */
    async getUserDetails(id) {
        const response = await api.get(`/users/${id}/details`);
        return response.data;
    },

    /**
     * Update user profile fields
     * Endpoint: PUT /api/v1/users/{id}
     */
    async updateUser(id, userData) {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    /**
     * Update user system role
     * Endpoint: PATCH /api/v1/users/{id}/role?role=...
     */
    async updateUserRole(id, role) {
        const response = await api.patch(`/users/${id}/role`, null, {
            params: { role },
        });
        return response.data;
    },

    /**
     * Update user status (ACTIVE, INACTIVE, BLOCKED)
     * Endpoint: PATCH /api/v1/users/{id}/status?status=...
     */
    async updateUserStatus(id, status) {
        const response = await api.patch(`/users/${id}/status`, null, {
            params: { status },
        });
        return response.data;
    },

    /**
     * Soft delete user
     * Endpoint: DELETE /api/v1/users/{id}
     */
    async deleteUser(id) {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export default userService;
