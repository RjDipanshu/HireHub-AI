/**
 * Standardized API Error Class for HireHub AI
 * Handles Spring Boot error responses:
 * 1. ErrorResponseDTO: { status: 400, error: "Bad Request", message: "...", timestamp: "..." }
 * 2. Field Validation Errors: { "email": "must be a well-formed email address", ... }
 * 3. Fallback Network / Client Errors
 */
export class ApiError extends Error {
    constructor({
        message,
        statusCode = 500,
        error = 'Internal Server Error',
        validationErrors = {},
        timestamp = new Date().toISOString(),
        raw = null,
    }) {
        super(message || 'An unexpected error occurred. Please try again.');
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.error = error;
        this.validationErrors = validationErrors;
        this.timestamp = timestamp;
        this.raw = raw;
    }

    /**
     * Check if error is due to authentication failure (401)
     */
    get isUnauthorized() {
        return this.statusCode === 401;
    }

    /**
     * Check if error is due to insufficient role permissions (403)
     */
    get isForbidden() {
        return this.statusCode === 403;
    }

    /**
     * Check if requested resource was not found (404)
     */
    get isNotFound() {
        return this.statusCode === 404;
    }

    /**
     * Check if request failed due to validation errors (400 / 422 with fields)
     */
    get isValidationError() {
        return (
            (this.statusCode === 400 || this.statusCode === 422) &&
            Object.keys(this.validationErrors).length > 0
        );
    }

    /**
     * Get error message for a specific field, if any
     * @param {string} fieldName 
     * @returns {string|null}
     */
    getFieldError(fieldName) {
        return this.validationErrors?.[fieldName] || null;
    }

    /**
     * Formats all validation errors into a single readable string
     * @returns {string}
     */
    getFormattedValidationErrors() {
        if (!this.validationErrors || Object.keys(this.validationErrors).length === 0) {
            return this.message;
        }
        return Object.entries(this.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
    }

    /**
     * Factory parser to transform any Axios error or unknown error into an ApiError
     * @param {any} err 
     * @returns {ApiError}
     */
    static fromAxiosError(err) {
        if (err instanceof ApiError) {
            return err;
        }

        // Axios network or timeout errors without HTTP response
        if (!err.response) {
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                return new ApiError({
                    message: 'Request timed out. Please check your connection and try again.',
                    statusCode: 408,
                    error: 'Request Timeout',
                    raw: err,
                });
            }

            const isOffline = typeof window !== 'undefined' && window.navigator && !window.navigator.onLine;
            if (err.message === 'Network Error' || isOffline) {
                return new ApiError({
                    message: 'Cannot reach the HireHub backend server. Please check your internet connection or verify the server is running.',
                    statusCode: 0,
                    error: 'Network Error',
                    raw: err,
                });
            }

            return new ApiError({
                message: err.message || 'Unknown network error occurred.',
                statusCode: 0,
                error: 'Network Error',
                raw: err,
            });
        }

        const { status, data } = err.response;

        // Spring Boot MethodArgumentNotValidException: returns Map<String, String> of field errors
        if (typeof data === 'object' && data !== null && !data.message && !data.error && !data.status) {
            const hasFieldKeys = Object.keys(data).length > 0;
            if (hasFieldKeys) {
                const firstError = Object.values(data)[0];
                return new ApiError({
                    message: firstError || 'Please correct the invalid input fields.',
                    statusCode: status,
                    error: 'Validation Error',
                    validationErrors: data,
                    raw: err,
                });
            }
        }

        // Standard Spring Boot ErrorResponseDTO: { status: 400, error: '...', message: '...', timestamp: '...' }
        // Or SecurityConfig JSON: { statusCode: 401, error: '...', message: '...' }
        const statusCode = data?.status || data?.statusCode || status;
        const errorTitle = data?.error || (status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Error');
        const message =
            data?.message ||
            (status === 401
                ? 'Your session has expired or is invalid. Please sign in again.'
                : status === 403
                ? 'You do not have sufficient permissions to perform this action.'
                : status === 404
                ? 'The requested resource could not be found.'
                : err.message || 'An error occurred while communicating with the server.');

        return new ApiError({
            message,
            statusCode,
            error: errorTitle,
            validationErrors: data?.errors || {},
            timestamp: data?.timestamp || new Date().toISOString(),
            raw: err,
        });
    }
}

export default ApiError;
