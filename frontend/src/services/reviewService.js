import api from './api';

export const reviewService = {
  /**
   * Get reviews for a company with pagination
   * @param {string} companyId
   * @param {number} page
   * @param {number} size
   */
  async getCompanyReviews(companyId, page = 0, size = 10) {
    try {
      const response = await api.get(`/companies/${companyId}/reviews`, {
        params: { page, size },
      });
      return response.data;
    } catch (err) {
      console.warn('[ReviewService] Error loading reviews:', err);
      return { content: [], totalElements: 0, totalPages: 1 };
    }
  },

  /**
   * Get aggregate review stats for a company (average rating, distribution, category scores)
   * @param {string} companyId
   */
  async getCompanyReviewStats(companyId) {
    try {
      const response = await api.get(`/companies/${companyId}/reviews/stats`);
      return response.data;
    } catch (err) {
      console.warn('[ReviewService] Error loading review stats:', err);
      return null;
    }
  },

  /**
   * Submit a company review
   * @param {string} companyId
   * @param {Object} reviewData
   */
  async addCompanyReview(companyId, reviewData) {
    const response = await api.post(`/companies/${companyId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Upvote a review as helpful
   * @param {string} companyId
   * @param {string} reviewId
   */
  async markHelpful(companyId, reviewId) {
    const response = await api.post(`/companies/${companyId}/reviews/${reviewId}/helpful`);
    return response.data;
  },
};

export default reviewService;
