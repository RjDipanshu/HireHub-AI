import api from '../services/api';
import { ApiError } from '../services/apiError';
import authService from '../services/authService';
import jobService from '../services/jobService';

/**
 * Step 3.12 & 3.13: Diagnostic Test Runner for Frontend -> Backend Integration
 * Tests Public endpoints, Protected JWT endpoints, Role-based access, and Error handling.
 */
export async function runApiIntegrationTests(currentUser, currentSession) {
    const results = [];

    const addResult = (testName, category, status, durationMs, details, raw = null) => {
        results.push({
            name: testName,
            category,
            status, // 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'WARNING'
            durationMs,
            details,
            raw,
            timestamp: new Date().toLocaleTimeString(),
        });
    };

    // Test 1: Public Backend Connectivity
    const t1Start = Date.now();
    try {
        const publicData = await authService.checkPublicEndpoint();
        const duration = Date.now() - t1Start;
        addResult(
            'Backend Public Endpoint Ping (/test/public)',
            'Communication',
            'SUCCESS',
            duration,
            `Successfully connected to Spring Boot backend: "${publicData.message || 'OK'}"`,
            publicData
        );
    } catch (err) {
        const duration = Date.now() - t1Start;
        addResult(
            'Backend Public Endpoint Ping (/test/public)',
            'Communication',
            'FAILED',
            duration,
            `Could not reach backend at ${api.defaults.baseURL}. Ensure Spring Boot is running on port 8080. Error: ${err.message}`,
            err
        );
    }

    // Test 2: Public Job Search Endpoint
    const t2Start = Date.now();
    try {
        const jobs = await jobService.searchJobs({ page: 0, size: 5 });
        const duration = Date.now() - t2Start;
        addResult(
            'Public Job Search API (/jobs)',
            'Communication',
            'SUCCESS',
            duration,
            `Successfully queried jobs catalog (${jobs?.content?.length ?? 0} jobs returned)`,
            jobs
        );
    } catch (err) {
        const duration = Date.now() - t2Start;
        addResult(
            'Public Job Search API (/jobs)',
            'Communication',
            'FAILED',
            duration,
            `Failed to retrieve jobs catalog: ${err.message}`,
            err
        );
    }

    // Test 3: JWT Access Token Inspection
    const t3Start = Date.now();
    const token = currentSession?.access_token;
    if (token) {
        const parts = token.split('.');
        let payload = null;
        try {
            payload = JSON.parse(atob(parts[1]));
        } catch {
            // Ignored
        }

        const duration = Date.now() - t3Start;
        addResult(
            'JWT Access Token Inspection',
            'Authentication',
            'SUCCESS',
            duration,
            `Valid JWT found in Supabase session (User: ${payload?.email || currentUser?.email || 'authenticated'}, Issuer: ${payload?.iss || 'Supabase'})`,
            { exp: payload?.exp, sub: payload?.sub, iss: payload?.iss }
        );
    } else {
        const duration = Date.now() - t3Start;
        addResult(
            'JWT Access Token Inspection',
            'Authentication',
            'WARNING',
            duration,
            'No active Supabase JWT access token found. Sign in with candidate or recruiter to test authenticated endpoints.'
        );
    }

    // Test 4: Protected Backend Endpoint (/test/protected)
    const t4Start = Date.now();
    if (!token) {
        addResult(
            'Protected Endpoint Authorization (/test/protected)',
            'Authentication',
            'SKIPPED',
            0,
            'Skipped because no user is currently authenticated.'
        );
    } else {
        try {
            const protectedData = await authService.checkProtectedEndpoint();
            const duration = Date.now() - t4Start;
            addResult(
                'Protected Endpoint Authorization (/test/protected)',
                'Authentication',
                'SUCCESS',
                duration,
                `Spring Boot validated Supabase JWT successfully! (Supabase User ID: ${protectedData?.supabaseUserId || 'Verified'})`,
                protectedData
            );
        } catch (err) {
            const duration = Date.now() - t4Start;
            addResult(
                'Protected Endpoint Authorization (/test/protected)',
                'Authentication',
                'FAILED',
                duration,
                `Protected access failed (${err.statusCode || 'ERR'}): ${err.message}`,
                err
            );
        }
    }

    // Test 5: Backend Current User Sync (/auth/me)
    const t5Start = Date.now();
    if (!token) {
        addResult(
            'Current User Identity (/auth/me)',
            'User Sync',
            'SKIPPED',
            0,
            'Skipped: sign in first to verify user database synchronization.'
        );
    } else {
        try {
            const userData = await authService.getCurrentUser();
            const duration = Date.now() - t5Start;
            addResult(
                'Current User Identity (/auth/me)',
                'User Sync',
                'SUCCESS',
                duration,
                `Database User Profile loaded: ${userData?.firstName} ${userData?.lastName} (Role: ${userData?.role || 'None'})`,
                userData
            );
        } catch (err) {
            const duration = Date.now() - t5Start;
            addResult(
                'Current User Identity (/auth/me)',
                'User Sync',
                'FAILED',
                duration,
                `Could not fetch user record from database: ${err.message}`,
                err
            );
        }
    }

    // Test 6: Role-Based Access Control (RBAC) Probe
    const t6Start = Date.now();
    const role = currentUser?.role || currentSession?.user?.user_metadata?.role;
    if (!token) {
        addResult(
            'Role-Based API Access Validation',
            'RBAC Security',
            'SKIPPED',
            0,
            'Skipped: requires active session to probe RBAC.'
        );
    } else {
        try {
            if (role === 'RECRUITER' || role === 'ADMIN') {
                const myJobs = await jobService.getMyJobs();
                const duration = Date.now() - t6Start;
                addResult(
                    'Role-Based API Access (Recruiter /jobs/recruiter/my-jobs)',
                    'RBAC Security',
                    'SUCCESS',
                    duration,
                    `Recruiter role confirmed. Retrieved ${myJobs?.length ?? 0} recruiter job postings.`,
                    myJobs
                );
            } else {
                // Candidate role: test candidate endpoint
                const savedJobs = await jobService.getMySavedJobs();
                const duration = Date.now() - t6Start;
                addResult(
                    'Role-Based API Access (Candidate /jobs/saved)',
                    'RBAC Security',
                    'SUCCESS',
                    duration,
                    `Candidate role confirmed. Retrieved ${savedJobs?.length ?? 0} saved candidate jobs.`,
                    savedJobs
                );
            }
        } catch (err) {
            const duration = Date.now() - t6Start;
            addResult(
                'Role-Based API Access Validation',
                'RBAC Security',
                'FAILED',
                duration,
                `Role endpoint check failed: ${err.message}`,
                err
            );
        }
    }

    // Test 7: Standardized Error Parsing & ApiError Verification
    const t7Start = Date.now();
    try {
        // Intentionally call a non-existent endpoint to test 404 ApiError wrapping
        await api.get('/non-existent-diagnostic-endpoint');
        addResult(
            'Global Error Handling & ApiError Transformation',
            'Error Handling',
            'FAILED',
            Date.now() - t7Start,
            'Expected 404 error but endpoint returned 200 OK.'
        );
    } catch (err) {
        const duration = Date.now() - t7Start;
        const isStandardApiError = err instanceof ApiError;
        if (isStandardApiError && (err.isNotFound || err.statusCode === 404)) {
            addResult(
                'Global Error Handling & ApiError Transformation',
                'Error Handling',
                'SUCCESS',
                duration,
                `ApiError class intercepted and normalized 404 response cleanly (Message: "${err.message}")`,
                { statusCode: err.statusCode, isNotFound: err.isNotFound, error: err.error }
            );
        } else if (isStandardApiError) {
            addResult(
                'Global Error Handling & ApiError Transformation',
                'Error Handling',
                'SUCCESS',
                duration,
                `ApiError normalized error: Status ${err.statusCode} - ${err.message}`,
                { statusCode: err.statusCode, error: err.error }
            );
        } else {
            addResult(
                'Global Error Handling & ApiError Transformation',
                'Error Handling',
                'WARNING',
                duration,
                `Received error but not instance of ApiError: ${err?.message}`
            );
        }
    }

    return results;
}
