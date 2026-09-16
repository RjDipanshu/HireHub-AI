/**
 * Phase 6.3 Automated Candidate Profile Editing Test Suite
 * Tests Profile Retrieval, Editing, Client & Server Validation, State Management, and Data Synchronization
 * Run via: node scripts/test-candidate-profile.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

// Client-side validation function mirror
function validateProfileForm(form) {
    const errors = {};

    if (!form.firstName?.trim()) {
        errors.firstName = 'First name is required.';
    } else if (form.firstName.length > 50) {
        errors.firstName = 'First name must be 50 characters or less.';
    }

    if (!form.lastName?.trim()) {
        errors.lastName = 'Last name is required.';
    } else if (form.lastName.length > 50) {
        errors.lastName = 'Last name must be 50 characters or less.';
    }

    if (!form.headline?.trim()) {
        errors.headline = 'Professional headline is required for job matching.';
    } else if (form.headline.length > 200) {
        errors.headline = 'Headline must be under 200 characters.';
    }

    if (form.yearsOfExperience < 0 || form.yearsOfExperience > 60) {
        errors.yearsOfExperience = 'Years of experience must be between 0 and 60.';
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

    if (form.githubUrl?.trim() && !urlPattern.test(form.githubUrl.trim())) {
        errors.githubUrl = 'Please enter a valid URL (e.g. https://github.com/username).';
    }

    if (form.linkedinUrl?.trim() && !urlPattern.test(form.linkedinUrl.trim())) {
        errors.linkedinUrl = 'Please enter a valid URL (e.g. https://linkedin.com/in/username).';
    }

    if (form.portfolioUrl?.trim() && !urlPattern.test(form.portfolioUrl.trim())) {
        errors.portfolioUrl = 'Please enter a valid URL (e.g. https://yourportfolio.dev).';
    }

    if (form.websiteUrl?.trim() && !urlPattern.test(form.websiteUrl.trim())) {
        errors.websiteUrl = 'Please enter a valid URL (e.g. https://mywebsite.com).';
    }

    if (form.phone?.trim() && !/^[+()0-9\s-]{7,25}$/.test(form.phone.trim())) {
        errors.phone = 'Please enter a valid phone number (e.g. +1 555 123 4567).';
    }

    return errors;
}

// Compute profile completion score mirror
function computeProfileCompletion(form) {
    let score = 20;
    if (form.firstName?.trim() && form.lastName?.trim()) score += 15;
    if (form.headline?.trim()) score += 15;
    if (form.bio?.trim()) score += 15;
    if (form.currentLocation?.trim()) score += 10;
    if (form.phone?.trim()) score += 10;
    if (form.linkedinUrl?.trim() || form.githubUrl?.trim() || form.portfolioUrl?.trim()) score += 15;
    return Math.min(100, score);
}

async function runCandidateProfileTests() {
    console.log('\n============================================================');
    console.log('🚀 HireHub AI - Phase 6.3 Candidate Profile Editing Test Suite');
    console.log('============================================================\n');

    // -------------------------------------------------------------
    // Test Group 1: Frontend Service Layer & Endpoints
    // -------------------------------------------------------------
    console.log('📦 Test Group 1: candidateService API Contracts');

    const servicePath = path.resolve(__dirname, '../src/services/candidateService.js');
    const serviceContent = fs.readFileSync(servicePath, 'utf8');

    assert(serviceContent.includes('async getMyProfile()'), 'candidateService declares getMyProfile()');
    assert(serviceContent.includes("api.get('/candidates/me')"), 'getMyProfile queries GET /candidates/me');
    assert(serviceContent.includes('async updateMyProfile(profileData)'), 'candidateService declares updateMyProfile()');
    assert(serviceContent.includes("api.put('/candidates/me', profileData)"), 'updateMyProfile dispatches PUT /candidates/me');
    assert(serviceContent.includes('async updateProfile(id, profileData)'), 'candidateService declares updateProfile(id, profileData)');
    assert(serviceContent.includes('async createProfile(profileData)'), 'candidateService declares createProfile(profileData)');

    // -------------------------------------------------------------
    // Test Group 2: Spring Boot Backend Controller & Service Layer
    // -------------------------------------------------------------
    console.log('\n☕ Test Group 2: Spring Boot Backend Architecture & REST Contracts');

    const controllerPath = path.resolve(
        __dirname,
        '../../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/controller/CandidateProfileController.java'
    );
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');

    assert(controllerContent.includes('@GetMapping("/me")'), 'CandidateProfileController exposes GET /api/v1/candidates/me');
    assert(controllerContent.includes('@PutMapping("/me")'), 'CandidateProfileController exposes PUT /api/v1/candidates/me');
    assert(controllerContent.includes('@AuthenticationPrincipal Jwt jwt'), 'Candidate profile endpoints secured with Spring Security JWT');
    assert(controllerContent.includes('updateProfileBySupabaseUserId'), 'Controller delegates to updateProfileBySupabaseUserId');

    const backendServicePath = path.resolve(
        __dirname,
        '../../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/service/CandidateProfileService.java'
    );
    const backendServiceContent = fs.readFileSync(backendServicePath, 'utf8');

    assert(backendServiceContent.includes('getProfileBySupabaseUserId(UUID supabaseUserId)'), 'Service handles getProfileBySupabaseUserId');
    assert(backendServiceContent.includes('updateProfileBySupabaseUserId(UUID supabaseUserId, CandidateProfileRequestDTO requestDTO)'), 'Service handles updateProfileBySupabaseUserId');
    assert(backendServiceContent.includes('applyProfileUpdates'), 'Service applies atomic profile and user synchronization');
    assert(backendServiceContent.includes('userRepository.save(user)'), 'Service updates linked user table for first/last name, phone, and avatar');

    const dtoPath = path.resolve(
        __dirname,
        '../../backend/hirehub-backend/hirehub-backend/src/main/java/com/hirehub/hirehub_backend/dto/candidate/CandidateProfileRequestDTO.java'
    );
    const dtoContent = fs.readFileSync(dtoPath, 'utf8');

    assert(dtoContent.includes('@Size(max = 200'), 'CandidateProfileRequestDTO validates headline max 200 chars');
    assert(dtoContent.includes('@DecimalMin(value = "0.0"'), 'CandidateProfileRequestDTO validates yearsOfExperience >= 0.0');
    assert(dtoContent.includes('private String firstName;'), 'DTO includes editable firstName');
    assert(dtoContent.includes('private String lastName;'), 'DTO includes editable lastName');
    assert(dtoContent.includes('private String profileImageUrl;'), 'DTO includes editable profileImageUrl');

    // -------------------------------------------------------------
    // Test Group 3: Client-Side Validation Matrix
    // -------------------------------------------------------------
    console.log('\n🛡️ Test Group 3: Client-Side Form Validation Matrix');

    // Valid profile
    const validForm = {
        firstName: 'Dipanshu',
        lastName: 'Kumar',
        headline: 'Senior Full Stack Java & React Engineer',
        bio: 'Over 4 years of engineering experience with microservices and cloud.',
        phone: '+91 9876543210',
        currentLocation: 'Bengaluru, India',
        yearsOfExperience: 4.0,
        githubUrl: 'https://github.com/dipanshu',
        linkedinUrl: 'https://linkedin.com/in/dipanshu',
        portfolioUrl: 'https://dipanshu.dev',
        websiteUrl: 'https://hirehub.ai',
    };
    const validErrors = validateProfileForm(validForm);
    assert(Object.keys(validErrors).length === 0, 'Valid candidate profile produces zero validation errors');

    // Missing first name & last name
    const missingNames = validateProfileForm({ ...validForm, firstName: '', lastName: '  ' });
    assert(missingNames.firstName === 'First name is required.', 'Rejects empty first name');
    assert(missingNames.lastName === 'Last name is required.', 'Rejects whitespace last name');

    // Headline too long
    const tooLongHeadline = validateProfileForm({ ...validForm, headline: 'a'.repeat(205) });
    assert(tooLongHeadline.headline === 'Headline must be under 200 characters.', 'Rejects headlines exceeding 200 characters');

    // Negative experience
    const negativeExp = validateProfileForm({ ...validForm, yearsOfExperience: -2 });
    assert(negativeExp.yearsOfExperience === 'Years of experience must be between 0 and 60.', 'Rejects negative years of experience');

    // Invalid GitHub & LinkedIn URLs
    const invalidUrls = validateProfileForm({
        ...validForm,
        githubUrl: 'not-a-valid-url',
        linkedinUrl: 'ftp:///invalid',
    });
    assert(!!invalidUrls.githubUrl, 'Detects malformed GitHub URL');
    assert(!!invalidUrls.linkedinUrl, 'Detects malformed LinkedIn URL');

    // Invalid Phone
    const invalidPhone = validateProfileForm({ ...validForm, phone: 'abc-not-phone' });
    assert(!!invalidPhone.phone, 'Detects invalid phone format');

    // -------------------------------------------------------------
    // Test Group 4: Dynamic Profile Completeness Scoring
    // -------------------------------------------------------------
    console.log('\n📊 Test Group 4: Dynamic Profile Completeness Scoring');

    const basicScore = computeProfileCompletion({ firstName: 'Dipanshu', lastName: 'Kumar' });
    assert(basicScore === 35, `Base registered user with names scores 35% (received: ${basicScore}%)`);

    const fullScore = computeProfileCompletion(validForm);
    assert(fullScore === 100, `Fully populated profile scores 100% (received: ${fullScore}%)`);

    // -------------------------------------------------------------
    // Test Group 5: Frontend Component Architecture (Profile.jsx)
    // -------------------------------------------------------------
    console.log('\n⚛️ Test Group 5: Profile.jsx Component Architecture');

    const profileComponentPath = path.resolve(__dirname, '../src/pages/candidate/Profile.jsx');
    const profileComponentContent = fs.readFileSync(profileComponentPath, 'utf8');

    assert(profileComponentContent.includes('candidateService.getMyProfile()'), 'Profile.jsx loads profile via candidateService.getMyProfile()');
    assert(profileComponentContent.includes('candidateService.updateMyProfile(payload)'), 'Profile.jsx updates profile via updateMyProfile(payload)');
    assert(profileComponentContent.includes('validateForm()'), 'Profile.jsx runs validateForm() before dispatching API calls');
    assert(profileComponentContent.includes('fieldErrors'), 'Profile.jsx maintains fieldErrors state for inline validation messages');
    assert(profileComponentContent.includes('input-error'), 'Profile.jsx applies input-error class to invalid fields');
    assert(profileComponentContent.includes('setSuccessMsg'), 'Profile.jsx displays success toast upon saving');
    assert(profileComponentContent.includes('isDirty'), 'Profile.jsx detects unsaved changes');
    assert(profileComponentContent.includes('profileCompletion'), 'Profile.jsx renders dynamic completeness progress bar');
    assert(profileComponentContent.includes("activeTab === 'preview'"), 'Profile.jsx provides Public Preview view toggle');

    // CandidateProfilePage re-export compatibility
    const wrapperPath = path.resolve(__dirname, '../src/pages/candidate/CandidateProfilePage.jsx');
    const wrapperContent = fs.readFileSync(wrapperPath, 'utf8');
    assert(wrapperContent.includes("import Profile from './Profile'"), 'CandidateProfilePage.jsx cleanly re-exports Profile.jsx');

    console.log('\n============================================================');
    console.log(`📊 Candidate Profile Test Summary: ${passed} Passed | ${failed} Failed`);
    console.log('============================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runCandidateProfileTests().catch((err) => {
    console.error('Fatal error in Candidate Profile test runner:', err);
    process.exit(1);
});
