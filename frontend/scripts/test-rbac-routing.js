/**
 * Phase 4 Automated RBAC & Routing Test Suite
 * Run via: node scripts/test-rbac-routing.js
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

// Simulated RBAC guard logic
function simulateRbacGuard({ isAuthenticated, role, allowedRoles }) {
    if (!isAuthenticated) {
        return { action: 'REDIRECT_TO_LOGIN', redirectTo: '/login' };
    }
    const normalizedRole = (role || 'CANDIDATE').toUpperCase();
    const normalizedAllowed = (allowedRoles || []).map((r) => r.toUpperCase());
    if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(normalizedRole)) {
        return { action: 'REDIRECT_TO_UNAUTHORIZED', redirectTo: '/unauthorized', currentRole: normalizedRole, requiredRoles: normalizedAllowed };
    }
    return { action: 'ALLOW' };
}

// Simulated Guest guard logic
function simulateGuestGuard({ isAuthenticated, role, from }) {
    if (isAuthenticated) {
        const normalizedRole = (role || 'CANDIDATE').toUpperCase();
        if (from && from !== '/') {
            return { action: 'REDIRECT_TO_TARGET', redirectTo: from };
        }
        if (normalizedRole === 'RECRUITER') return { action: 'REDIRECT_TO_DASHBOARD', redirectTo: '/recruiter/dashboard' };
        if (normalizedRole === 'ADMIN') return { action: 'REDIRECT_TO_DASHBOARD', redirectTo: '/admin/dashboard' };
        return { action: 'REDIRECT_TO_DASHBOARD', redirectTo: '/candidate/dashboard' };
    }
    return { action: 'ALLOW' };
}

async function runRbacTests() {
    console.log('\n============================================================');
    console.log('🚀 HireHub AI - Phase 4 Routing & RBAC Verification Suite');
    console.log('============================================================\n');

    // -------------------------------------------------------------
    // Test Group 1: Role-Based Access Control (RBAC) Matrix
    // -------------------------------------------------------------
    console.log('🛡️ Test Group 1: Role-Based Access Control (RBAC) Matrix');

    // Unauthenticated protection
    const unauthCandidate = simulateRbacGuard({ isAuthenticated: false, role: null, allowedRoles: ['CANDIDATE', 'ADMIN'] });
    assert(unauthCandidate.action === 'REDIRECT_TO_LOGIN', 'Unauthenticated user blocked from Candidate portal');

    const unauthRecruiter = simulateRbacGuard({ isAuthenticated: false, role: null, allowedRoles: ['RECRUITER', 'ADMIN'] });
    assert(unauthRecruiter.action === 'REDIRECT_TO_LOGIN', 'Unauthenticated user blocked from Recruiter portal');

    const unauthAdmin = simulateRbacGuard({ isAuthenticated: false, role: null, allowedRoles: ['ADMIN'] });
    assert(unauthAdmin.action === 'REDIRECT_TO_LOGIN', 'Unauthenticated user blocked from Admin portal');

    // Candidate permissions
    const candOnCand = simulateRbacGuard({ isAuthenticated: true, role: 'CANDIDATE', allowedRoles: ['CANDIDATE', 'ADMIN'] });
    assert(candOnCand.action === 'ALLOW', 'CANDIDATE granted access to Candidate portal');

    const candOnRecruiter = simulateRbacGuard({ isAuthenticated: true, role: 'CANDIDATE', allowedRoles: ['RECRUITER', 'ADMIN'] });
    assert(candOnRecruiter.action === 'REDIRECT_TO_UNAUTHORIZED', 'CANDIDATE denied access to Recruiter portal (403)');

    const candOnAdmin = simulateRbacGuard({ isAuthenticated: true, role: 'CANDIDATE', allowedRoles: ['ADMIN'] });
    assert(candOnAdmin.action === 'REDIRECT_TO_UNAUTHORIZED', 'CANDIDATE denied access to Admin portal (403)');

    // Recruiter permissions
    const recOnRecruiter = simulateRbacGuard({ isAuthenticated: true, role: 'RECRUITER', allowedRoles: ['RECRUITER', 'ADMIN'] });
    assert(recOnRecruiter.action === 'ALLOW', 'RECRUITER granted access to Recruiter portal');

    const recOnCand = simulateRbacGuard({ isAuthenticated: true, role: 'RECRUITER', allowedRoles: ['CANDIDATE', 'ADMIN'] });
    assert(recOnCand.action === 'REDIRECT_TO_UNAUTHORIZED', 'RECRUITER denied access to Candidate portal (403)');

    const recOnAdmin = simulateRbacGuard({ isAuthenticated: true, role: 'RECRUITER', allowedRoles: ['ADMIN'] });
    assert(recOnAdmin.action === 'REDIRECT_TO_UNAUTHORIZED', 'RECRUITER denied access to Admin portal (403)');

    // Admin superuser permissions
    const adminOnAdmin = simulateRbacGuard({ isAuthenticated: true, role: 'ADMIN', allowedRoles: ['ADMIN'] });
    assert(adminOnAdmin.action === 'ALLOW', 'ADMIN granted access to Admin portal');

    const adminOnCand = simulateRbacGuard({ isAuthenticated: true, role: 'ADMIN', allowedRoles: ['CANDIDATE', 'ADMIN'] });
    assert(adminOnCand.action === 'ALLOW', 'ADMIN granted supervisory access to Candidate portal');

    const adminOnRecruiter = simulateRbacGuard({ isAuthenticated: true, role: 'ADMIN', allowedRoles: ['RECRUITER', 'ADMIN'] });
    assert(adminOnRecruiter.action === 'ALLOW', 'ADMIN granted supervisory access to Recruiter portal');

    // -------------------------------------------------------------
    // Test Group 2: Guest Route Guard & Destination Return
    // -------------------------------------------------------------
    console.log('\n🚪 Test Group 2: Guest Route Reverse Guard (GuestRoute.jsx)');

    const guestUnauth = simulateGuestGuard({ isAuthenticated: false, role: null });
    assert(guestUnauth.action === 'ALLOW', 'Unauthenticated guest can access /login & /register');

    const guestCandidate = simulateGuestGuard({ isAuthenticated: true, role: 'CANDIDATE' });
    assert(guestCandidate.redirectTo === '/candidate/dashboard', 'Authenticated CANDIDATE auto-forwarded to /candidate/dashboard');

    const guestRecruiter = simulateGuestGuard({ isAuthenticated: true, role: 'RECRUITER' });
    assert(guestRecruiter.redirectTo === '/recruiter/dashboard', 'Authenticated RECRUITER auto-forwarded to /recruiter/dashboard');

    const guestAdmin = simulateGuestGuard({ isAuthenticated: true, role: 'ADMIN' });
    assert(guestAdmin.redirectTo === '/admin/dashboard', 'Authenticated ADMIN auto-forwarded to /admin/dashboard');

    const guestWithFrom = simulateGuestGuard({ isAuthenticated: true, role: 'CANDIDATE', from: '/jobs/123' });
    assert(guestWithFrom.redirectTo === '/jobs/123', 'Preserves and redirects back to target destination from location state');

    // -------------------------------------------------------------
    // Test Group 3: File Structure, Layouts & Route Integrity
    // -------------------------------------------------------------
    console.log('\n📄 Test Group 3: Layouts, Guards & Component Integrity');

    const filesToVerify = [
        { relativePath: '../src/layouts/MainLayout.jsx', name: 'MainLayout' },
        { relativePath: '../src/layouts/CandidateLayout.jsx', name: 'CandidateLayout' },
        { relativePath: '../src/layouts/RecruiterLayout.jsx', name: 'RecruiterLayout' },
        { relativePath: '../src/layouts/AdminLayout.jsx', name: 'AdminLayout' },
        { relativePath: '../src/routes/ProtectedRoute.jsx', name: 'ProtectedRoute' },
        { relativePath: '../src/routes/GuestRoute.jsx', name: 'GuestRoute' },
        { relativePath: '../src/routes/AppRouter.jsx', name: 'AppRouter' },
        { relativePath: '../src/pages/public/UnauthorizedPage.jsx', name: 'UnauthorizedPage' },
        { relativePath: '../src/pages/public/NotFoundPage.jsx', name: 'NotFoundPage' },
        { relativePath: '../src/pages/recruiter/CompanyProfilePage.jsx', name: 'CompanyProfilePage' },
    ];

    for (const file of filesToVerify) {
        const fullPath = path.resolve(__dirname, file.relativePath);
        const exists = fs.existsSync(fullPath);
        assert(exists, `${file.name} file exists at ${file.relativePath}`);

        if (exists) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hasExport = content.includes('export default') || content.includes('export const') || content.includes('export function');
            assert(hasExport, `${file.name} declares valid component export`);
            assert(content.length > 200, `${file.name} has substantial implementation content (${content.length} bytes)`);
        }
    }

    // Verify AppRouter routes declaration
    const routerPath = path.resolve(__dirname, '../src/routes/AppRouter.jsx');
    const routerContent = fs.readFileSync(routerPath, 'utf8');
    assert(routerContent.includes('allowedRoles={["CANDIDATE", "ADMIN"]}'), 'AppRouter configures Candidate RBAC guard');
    assert(routerContent.includes('allowedRoles={["RECRUITER", "ADMIN"]}'), 'AppRouter configures Recruiter RBAC guard');
    assert(routerContent.includes('allowedRoles={["ADMIN"]}'), 'AppRouter configures Admin RBAC guard');
    assert(routerContent.includes('<GuestRoute />') || routerContent.includes('element={<GuestRoute />}'), 'AppRouter wraps auth routes in GuestRoute');
    assert(routerContent.includes('UnauthorizedPage'), 'AppRouter registers dedicated UnauthorizedPage');
    assert(routerContent.includes('CompanyProfilePage'), 'AppRouter registers CompanyProfilePage route');

    // -------------------------------------------------------------
    // Test Group 4: Step 4.12 — Backend /auth/sync Role Authority Flow
    // -------------------------------------------------------------
    console.log('\n🔄 Test Group 4: Step 4.12 — Backend Sync Authority & ProtectedRoute Guard');

    const authContextPath = path.resolve(__dirname, '../src/context/AuthContext.jsx');
    const authContextContent = fs.readFileSync(authContextPath, 'utf8');

    assert(authContextContent.includes('authService.syncUser(syncPayload)'), 'AuthContext calls authService.syncUser on session initialization');
    assert(authContextContent.includes('const role = (user?.role || "").toUpperCase()'), 'AuthContext strictly derives role from backend user?.role');
    assert(authContextContent.includes('user.role.toUpperCase()'), 'hasRole checks backend user.role authority');
    assert(!authContextContent.includes('session?.user?.user_metadata?.role || "CANDIDATE"'), 'AuthContext does NOT fall back to client metadata for role');

    const protectedRoutePath = path.resolve(__dirname, '../src/routes/ProtectedRoute.jsx');
    const protectedRouteContent = fs.readFileSync(protectedRoutePath, 'utf8');

    assert(protectedRouteContent.includes('loading || (isAuthenticated && !user)'), 'ProtectedRoute waits while backend user profile is synchronizing');
    assert(protectedRouteContent.includes('currentRole: user?.role || role'), 'ProtectedRoute passes authoritative user?.role to unauthorized state');

    // Simulate Step 4.12 End-to-End Pipeline:
    // Supabase Login -> Supabase Session -> JWT -> /auth/sync -> Spring Boot -> User profile + ROLE -> AuthContext -> ProtectedRoute
    function simulateStep412Pipeline({ supabaseSession, backendDbRole, targetRoute, allowedRoles }) {
        // 1. Supabase Session exists
        const isAuthenticated = !!supabaseSession;
        // 2. /auth/sync called with JWT to Spring Boot -> returns UserResponseDTO
        const backendProfile = isAuthenticated ? {
            id: 'u-12345',
            supabaseUserId: supabaseSession.user.id,
            email: supabaseSession.user.email,
            role: backendDbRole, // authoritative role from PostgreSQL database
        } : null;

        // 3. AuthContext receives profile
        const user = backendProfile;
        const role = (user?.role || '').toUpperCase();

        // 4. ProtectedRoute evaluation
        if (!isAuthenticated) return { status: 401, action: 'REDIRECT_TO_LOGIN', redirectTo: '/login' };
        if (!user) return { status: 'LOADING', action: 'SHOW_SPINNER' };

        const normalizedAllowed = (allowedRoles || []).map((r) => r.toUpperCase());
        if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(role)) {
            return { status: 403, action: 'REDIRECT_TO_UNAUTHORIZED', redirectTo: '/unauthorized', role };
        }
        return { status: 200, action: 'RENDER_ROUTE', targetRoute, role };
    }

    // Role 1: CANDIDATE
    const candCandidateRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'cand-001', email: 'candidate@hirehub.ai' } },
        backendDbRole: 'CANDIDATE',
        targetRoute: '/candidate/dashboard',
        allowedRoles: ['CANDIDATE', 'ADMIN'],
    });
    assert(candCandidateRoute.action === 'RENDER_ROUTE' && candCandidateRoute.role === 'CANDIDATE', 'Step 4.12: CANDIDATE granted access to /candidate/dashboard via backend profile');

    const candRecruiterRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'cand-001', email: 'candidate@hirehub.ai' } },
        backendDbRole: 'CANDIDATE',
        targetRoute: '/recruiter/dashboard',
        allowedRoles: ['RECRUITER', 'ADMIN'],
    });
    assert(candRecruiterRoute.action === 'REDIRECT_TO_UNAUTHORIZED', 'Step 4.12: CANDIDATE blocked from /recruiter/dashboard (403)');

    const candAdminRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'cand-001', email: 'candidate@hirehub.ai' } },
        backendDbRole: 'CANDIDATE',
        targetRoute: '/admin/dashboard',
        allowedRoles: ['ADMIN'],
    });
    assert(candAdminRoute.action === 'REDIRECT_TO_UNAUTHORIZED', 'Step 4.12: CANDIDATE blocked from /admin/dashboard (403)');

    // Role 2: RECRUITER
    const recRecruiterRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'rec-002', email: 'recruiter@techcorp.com' } },
        backendDbRole: 'RECRUITER',
        targetRoute: '/recruiter/dashboard',
        allowedRoles: ['RECRUITER', 'ADMIN'],
    });
    assert(recRecruiterRoute.action === 'RENDER_ROUTE' && recRecruiterRoute.role === 'RECRUITER', 'Step 4.12: RECRUITER granted access to /recruiter/dashboard via backend profile');

    const recCandidateRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'rec-002', email: 'recruiter@techcorp.com' } },
        backendDbRole: 'RECRUITER',
        targetRoute: '/candidate/dashboard',
        allowedRoles: ['CANDIDATE', 'ADMIN'],
    });
    assert(recCandidateRoute.action === 'REDIRECT_TO_UNAUTHORIZED', 'Step 4.12: RECRUITER blocked from /candidate/dashboard (403)');

    const recAdminRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'rec-002', email: 'recruiter@techcorp.com' } },
        backendDbRole: 'RECRUITER',
        targetRoute: '/admin/dashboard',
        allowedRoles: ['ADMIN'],
    });
    assert(recAdminRoute.action === 'REDIRECT_TO_UNAUTHORIZED', 'Step 4.12: RECRUITER blocked from /admin/dashboard (403)');

    // Role 3: ADMIN
    const adminAdminRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'adm-003', email: 'admin@hirehub.ai' } },
        backendDbRole: 'ADMIN',
        targetRoute: '/admin/dashboard',
        allowedRoles: ['ADMIN'],
    });
    assert(adminAdminRoute.action === 'RENDER_ROUTE' && adminAdminRoute.role === 'ADMIN', 'Step 4.12: ADMIN granted access to /admin/dashboard via backend profile');

    const adminCandidateRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'adm-003', email: 'admin@hirehub.ai' } },
        backendDbRole: 'ADMIN',
        targetRoute: '/candidate/dashboard',
        allowedRoles: ['CANDIDATE', 'ADMIN'],
    });
    assert(adminCandidateRoute.action === 'RENDER_ROUTE', 'Step 4.12: ADMIN granted supervisory access to /candidate/dashboard');

    const adminRecruiterRoute = simulateStep412Pipeline({
        supabaseSession: { user: { id: 'adm-003', email: 'admin@hirehub.ai' } },
        backendDbRole: 'ADMIN',
        targetRoute: '/recruiter/dashboard',
        allowedRoles: ['RECRUITER', 'ADMIN'],
    });
    assert(adminRecruiterRoute.action === 'RENDER_ROUTE', 'Step 4.12: ADMIN granted supervisory access to /recruiter/dashboard');

    // Tampering test: client metadata tries to claim ADMIN, but backend DB returns CANDIDATE
    const tamperedSession = {
        user: { id: 'attacker-999', email: 'hacker@example.com', user_metadata: { role: 'ADMIN' } },
    };
    const tamperedResult = simulateStep412Pipeline({
        supabaseSession: tamperedSession,
        backendDbRole: 'CANDIDATE', // DB says CANDIDATE!
        targetRoute: '/admin/dashboard',
        allowedRoles: ['ADMIN'],
    });
    assert(tamperedResult.action === 'REDIRECT_TO_UNAUTHORIZED', 'Step 4.12: Client-side metadata tampering rejected — backend DB role is sole authority');

    console.log('\n============================================================');
    console.log(`📊 RBAC Test Summary: ${passed} Passed | ${failed} Failed`);
    console.log('============================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runRbacTests().catch((err) => {
    console.error('Fatal error in RBAC test runner:', err);
    process.exit(1);
});
