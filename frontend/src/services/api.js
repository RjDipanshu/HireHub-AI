import axios from 'axios';
import { supabase } from '../lib/supabaseClient.js';
import { ApiError } from './apiError.js';
import telemetryService from './telemetryService.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env) ? process.env : {};

/**
 * Centralized Axios Instance for HireHub AI
 * Connects React UI to Spring Boot REST API
 */
const api = axios.create({
    baseURL: env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Step 3.2: JWT Authentication Request Interceptor
 * Injects Supabase JWT access token into the Authorization Bearer header
 */
api.interceptors.request.use(
    async (config) => {
        try {
            // Allow requests to bypass auth if explicitly configured
            if (config.skipAuth) {
                return config;
            }

            let token = null;
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                token = session?.access_token;
            } catch (authError) {
                console.warn('[API Client] Supabase auth getSession check:', authError?.message || authError);
            }

            if (!token && typeof localStorage !== 'undefined') {
                try {
                    const devSessionStr = localStorage.getItem('hirehub_dev_session');
                    if (devSessionStr) {
                        const parsed = JSON.parse(devSessionStr);
                        token = parsed?.access_token;
                    }
                } catch (e) {}
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (generalErr) {
            console.warn('[API Client] Request auth interceptor notice:', generalErr?.message || generalErr);
        }

        // Attach request timestamp for debugging & latency measurements
        config.metadata = { startTime: Date.now() };

        return config;
    },
    (error) => Promise.reject(ApiError.fromAxiosError(error))
);

/**
 * Step 3.3: Global API Error Handling & Response Interceptor
 * Transforms raw errors into structured ApiError instances
 */
api.interceptors.response.use(
    (response) => {
        const duration = response.config?.metadata?.startTime ? Date.now() - response.config.metadata.startTime : 0;
        telemetryService.recordApiMetric(response.config?.url, duration, response.status);

        if (env.DEV && duration > 1500) {
            console.warn(`[API Client] Slow request (${duration}ms): ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        const apiError = ApiError.fromAxiosError(error);
        const duration = error.config?.metadata?.startTime ? Date.now() - error.config.metadata.startTime : 0;
        telemetryService.recordApiMetric(error.config?.url, duration, apiError.statusCode, apiError.message);

        // Notify application if session expired or unauthorized (401)
        if (apiError.isUnauthorized && typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('hirehub:unauthorized', {
                    detail: {
                        error: apiError,
                        timestamp: Date.now(),
                    },
                })
            );
        }

        // Development diagnostic logging
        if (env.DEV) {
            console.error(
                `[API Client Error ${apiError.statusCode}] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
                apiError.message,
                apiError.validationErrors
            );
        }

        return Promise.reject(apiError);
    }
);

export default api;
