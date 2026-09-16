import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Step 4.3: GuestRoute (Reverse Auth Guard)
 * Protects login/registration pages from already authenticated users.
 * Automatically forwards authenticated users to their role portal or previously intended destination.
 */
export default function GuestRoute() {
    const { isAuthenticated, isInitializing, user, getDashboardPath } = useAuth();
    const location = useLocation();

    // Only wait while the initial session authentication check completes on page load
    if (isInitializing) {
        return null;
    }

    // Never redirect away from auth recovery / email verification pages
    if (location.pathname === '/reset-password' || location.pathname === '/verify-email') {
        return <Outlet />;
    }

    if (isAuthenticated && user) {
        // If user came from a protected page previously, return them there
        const fromPath = location.state?.from?.pathname;
        const targetPath = (fromPath && fromPath !== '/' && fromPath !== '/login')
            ? fromPath
            : getDashboardPath(user?.role);
        return <Navigate to={targetPath} replace />;
    }

    return <Outlet />;
}
