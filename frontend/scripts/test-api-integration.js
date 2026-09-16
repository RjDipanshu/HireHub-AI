/**
 * Automated Verification Script for Phase 3 API Integration
 * Run via: node scripts/test-api-integration.js
 */

import { ApiError } from '../src/services/apiError.js';
import api from '../src/services/api.js';
import * as services from '../src/services/index.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passedCount++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failedCount++;
    }
}

async function runTests() {
    console.log('\n============================================================');
    console.log('🚀 HireHub AI - Phase 3 Backend API Integration Test Suite');
    console.log('============================================================\n');

    // -------------------------------------------------------------
    // Test Group 1: Centralized Axios Client Configuration
    // -------------------------------------------------------------
    console.log('📦 Test Group 1: Centralized Axios Client (api.js)');
    assert(api !== undefined && api !== null, 'Axios client instance exported successfully');
    assert(api.defaults.baseURL !== undefined, `Base URL configured: ${api.defaults.baseURL}`);
    assert(api.defaults.timeout === 20000, `Timeout configured: ${api.defaults.timeout}ms`);
    assert(api.defaults.headers['Content-Type'] === 'application/json', 'Default Content-Type is application/json');
    assert(api.defaults.headers['Accept'] === 'application/json', 'Default Accept is application/json');
    assert(api.interceptors.request.handlers.length > 0, 'JWT Authentication Request Interceptor registered');
    assert(api.interceptors.response.handlers.length > 0, 'Global Error Handling Response Interceptor registered');

    // -------------------------------------------------------------
    // Test Group 2: Standardized ApiError Parsing
    // -------------------------------------------------------------
    console.log('\n🛡️ Test Group 2: Standardized ApiError Parsing (apiError.js)');

    // 2.1 Spring Boot ErrorResponseDTO
    const springErrorObj = {
        response: {
            status: 403,
            data: {
                status: 403,
                error: 'Forbidden',
                message: 'Access Denied: You do not have permission to access this resource',
                timestamp: '2026-09-07T14:00:00',
            },
        },
    };
    const parsedForbidden = ApiError.fromAxiosError(springErrorObj);
    assert(parsedForbidden instanceof ApiError, 'Converts Axios error to ApiError instance');
    assert(parsedForbidden.statusCode === 403, 'Correctly captures 403 status code');
    assert(parsedForbidden.isForbidden === true, 'isForbidden getter returns true');
    assert(parsedForbidden.isUnauthorized === false, 'isUnauthorized getter returns false');
    assert(parsedForbidden.message.includes('Access Denied'), 'Preserves backend error message');

    // 2.2 Spring Boot MethodArgumentNotValidException (Field Errors)
    const springValidationObj = {
        response: {
            status: 400,
            data: {
                title: 'Job title is required',
                location: 'Location is mandatory',
            },
        },
    };
    const parsedValidation = ApiError.fromAxiosError(springValidationObj);
    assert(parsedValidation.isValidationError === true, 'Identifies validation error map');
    assert(parsedValidation.getFieldError('title') === 'Job title is required', 'Extracts field error for title');
    assert(parsedValidation.getFieldError('location') === 'Location is mandatory', 'Extracts field error for location');
    assert(parsedValidation.getFieldError('unknown') === null, 'Returns null for non-existent field error');

    // 2.3 Network / Timeout Errors
    const timeoutErr = {
        code: 'ECONNABORTED',
        message: 'timeout of 20000ms exceeded',
    };
    const parsedTimeout = ApiError.fromAxiosError(timeoutErr);
    assert(parsedTimeout.statusCode === 408, 'Handles timeout error with 408 status');
    assert(parsedTimeout.message.includes('timed out'), 'Provides friendly timeout message');

    // -------------------------------------------------------------
    // Test Group 3: Domain Service Methods & Contract Verification
    // -------------------------------------------------------------
    console.log('\n💼 Test Group 3: Domain API Service Contracts');

    // 3.1 authService
    assert(typeof services.authService.signUp === 'function', 'authService.signUp exists');
    assert(typeof services.authService.signIn === 'function', 'authService.signIn exists');
    assert(typeof services.authService.syncUser === 'function', 'authService.syncUser exists');
    assert(typeof services.authService.getCurrentUser === 'function', 'authService.getCurrentUser exists');
    assert(typeof services.authService.checkPublicEndpoint === 'function', 'authService.checkPublicEndpoint exists');
    assert(typeof services.authService.checkProtectedEndpoint === 'function', 'authService.checkProtectedEndpoint exists');

    // 3.2 candidateService
    assert(typeof services.candidateService.getMyProfile === 'function', 'candidateService.getMyProfile exists');
    assert(typeof services.candidateService.createProfile === 'function', 'candidateService.createProfile exists');
    assert(typeof services.candidateService.addEducation === 'function', 'candidateService.addEducation exists');
    assert(typeof services.candidateService.addExperience === 'function', 'candidateService.addExperience exists');
    assert(typeof services.candidateService.addSkill === 'function', 'candidateService.addSkill exists');
    assert(typeof services.candidateService.addResume === 'function', 'candidateService.addResume exists');
    assert(typeof services.candidateService.getSkills === 'function', 'candidateService.getSkills exists');

    // 3.3 recruiterService
    assert(typeof services.recruiterService.getMyProfile === 'function', 'recruiterService.getMyProfile exists');
    assert(typeof services.recruiterService.createProfile === 'function', 'recruiterService.createProfile exists');
    assert(typeof services.recruiterService.joinCompany === 'function', 'recruiterService.joinCompany exists');
    assert(typeof services.recruiterService.getAllCompanies === 'function', 'recruiterService.getAllCompanies exists');
    assert(typeof services.recruiterService.createCompany === 'function', 'recruiterService.createCompany exists');

    // 3.4 jobService
    assert(typeof services.jobService.searchJobs === 'function', 'jobService.searchJobs exists');
    assert(typeof services.jobService.getJobById === 'function', 'jobService.getJobById exists');
    assert(typeof services.jobService.createJob === 'function', 'jobService.createJob exists');
    assert(typeof services.jobService.updateJobStatus === 'function', 'jobService.updateJobStatus exists');
    assert(typeof services.jobService.saveJob === 'function', 'jobService.saveJob exists');
    assert(typeof services.jobService.getMySavedJobs === 'function', 'jobService.getMySavedJobs exists');

    // 3.5 applicationService
    assert(typeof services.applicationService.applyForJob === 'function', 'applicationService.applyForJob exists');
    assert(typeof services.applicationService.getMyApplications === 'function', 'applicationService.getMyApplications exists');
    assert(typeof services.applicationService.getApplicationsByJob === 'function', 'applicationService.getApplicationsByJob exists');
    assert(typeof services.applicationService.updateApplicationStatus === 'function', 'applicationService.updateApplicationStatus exists');

    // 3.6 interviewService
    assert(typeof services.interviewService.scheduleInterview === 'function', 'interviewService.scheduleInterview exists');
    assert(typeof services.interviewService.getCandidateInterviews === 'function', 'interviewService.getCandidateInterviews exists');
    assert(typeof services.interviewService.rescheduleInterview === 'function', 'interviewService.rescheduleInterview exists');
    assert(typeof services.interviewService.completeInterview === 'function', 'interviewService.completeInterview exists');

    // 3.7 notificationService
    assert(typeof services.notificationService.getNotifications === 'function', 'notificationService.getNotifications exists');
    assert(typeof services.notificationService.getUnreadCount === 'function', 'notificationService.getUnreadCount exists');
    assert(typeof services.notificationService.markAsRead === 'function', 'notificationService.markAsRead exists');

    // 3.8 aiService
    assert(typeof services.aiService.analyzeResume === 'function', 'aiService.analyzeResume exists');
    assert(typeof services.aiService.generateCoverLetter === 'function', 'aiService.generateCoverLetter exists');
    assert(typeof services.aiService.generateInterviewPrep === 'function', 'aiService.generateInterviewPrep exists');
    assert(typeof services.aiService.rankApplicants === 'function', 'aiService.rankApplicants exists');
    assert(typeof services.aiService.generateJobDescription === 'function', 'aiService.generateJobDescription exists');

    // -------------------------------------------------------------
    // Test Group 4: Live Backend Communication Check (Optional / Warning if server offline)
    // -------------------------------------------------------------
    console.log('\n🌐 Test Group 4: Live Backend Ping Check');
    try {
        const pingResponse = await services.authService.checkPublicEndpoint();
        console.log(`  🟢 Backend is LIVE on ${api.defaults.baseURL}:`, pingResponse);
        passedCount++;
    } catch (err) {
        console.log(`  🟡 Backend is currently offline on ${api.defaults.baseURL} (Start via './mvnw spring-boot:run')`);
        console.log(`     Error details: ${err.message}`);
    }

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`📊 Test Summary: ${passedCount} Passed | ${failedCount} Failed`);
    console.log('============================================================\n');

    if (failedCount > 0) {
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
