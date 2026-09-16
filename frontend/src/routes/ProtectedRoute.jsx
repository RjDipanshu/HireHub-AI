import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

/**
 * Step 4.4 & 4.5: ProtectedRoute with Role-Based Access Control (RBAC)
 * - Guards private routes from unauthenticated users (preserves intended destination in location state)
 * - Restricts access based on allowed user roles ('CANDIDATE', 'RECRUITER', 'ADMIN')
 * - Displays a sleek loading state while session initializes
 */
export default function ProtectedRoute({ allowedRoles }) {
    const { isInitializing, loading, isAuthenticated, user, role, hasRole, getDashboardPath } = useAuth();
    const location = useLocation();

    // While session initializes or while backend user profile sync (/auth/sync) is resolving:
    if (isInitializing || loading || (isAuthenticated && !user)) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "70vh",
                    gap: "1rem",
                }}
            >
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "var(--ai-gradient, linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pulse 1.5s infinite ease-in-out",
                        boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
                    }}
                >
                    <Sparkles size={24} color="#ffffff" />
                </div>
                <div style={{ color: "var(--text-secondary, #94a3b8)", fontSize: "0.95rem", fontWeight: 500 }}>
                    Authenticating session & backend permissions...
                </div>
            </div>
        );
    }

    // Unauthenticated: redirect to login and preserve the intended target location
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based protection check: strictly based on user?.role returned from backend /auth/sync
    if (allowedRoles && !hasRole(allowedRoles)) {
        const userRole = user?.role || role;
        const targetDashboard = getDashboardPath ? getDashboardPath(userRole) : '/candidate/dashboard';

        // Gracefully route the user to their active role portal instead of showing a 403 error page
        if (location.pathname !== targetDashboard) {
            return <Navigate to={targetDashboard} replace />;
        }

        return (
            <Navigate
                to="/unauthorized"
                state={{
                    requiredRoles: allowedRoles,
                    currentRole: user?.role || role,
                    attemptedPath: location.pathname,
                }}
                replace
            />
        );
    }

    return <Outlet />;
}
