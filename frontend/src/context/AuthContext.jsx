import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabaseClient";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);

    /**
     * Synchronizes Supabase authenticated user with Spring Boot backend:
     * Endpoint: POST /api/v1/auth/sync
     * DTO: UserSyncDTO (firstName, lastName, phone, role, profileImageUrl)
     */
    const syncUser = async (supabaseUser) => {
        if (!supabaseUser) {
            return null;
        }

        try {
            const metadata = supabaseUser.user_metadata || {};
            const fullName = (metadata.full_name || metadata.name || "").trim();
            const nameParts = fullName.split(" ");
            const firstName = metadata.first_name || nameParts[0] || "HireHub";
            const lastName = metadata.last_name || nameParts.slice(1).join(" ") || "User";

            const syncPayload = {
                firstName,
                lastName,
                phone: metadata.phone || null,
                role: metadata.role || "CANDIDATE",
                profileImageUrl: metadata.avatar_url || null,
            };

            // Authoritative profile from Spring Boot (PostgreSQL database)
            const backendProfile = await authService.syncUser(syncPayload);
            return backendProfile;
        } catch (error) {
            console.warn("[AuthContext] Backend sync fallback notice:", error?.message || error);
            // If sync fails (e.g. network blip), attempt /auth/me
            try {
                const currentProfile = await authService.getCurrentUser();
                if (currentProfile) return currentProfile;
            } catch {
                // Secondary fallback only if backend completely unreachable
            }

            const metadata = supabaseUser.user_metadata || {};
            const fullName = (metadata.full_name || metadata.name || "").trim();
            const nameParts = fullName.split(" ");
            return {
                id: supabaseUser.id,
                supabaseUserId: supabaseUser.id,
                email: supabaseUser.email,
                firstName: metadata.first_name || nameParts[0] || "HireHub",
                lastName: metadata.last_name || nameParts.slice(1).join(" ") || "User",
                role: metadata.role || "CANDIDATE",
                emailVerified: !!supabaseUser.email_confirmed_at,
            };
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                const session = await authService.getSession();

                if (!mounted) return;

                setSession(session);

                if (session?.user) {
                    const profile = await syncUser(session.user);
                    if (mounted) {
                        setUser(profile);
                    }
                } else {
                    if (mounted) {
                        setUser(null);
                    }
                }
            } catch (err) {
                console.error("Failed initializing auth session:", err);
                if (mounted) {
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setIsInitializing(false);
                }
            }
        };

        initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                if (!mounted) return;

                if (newSession?.user) {
                    setSession(newSession);
                    setLoading(true);
                    try {
                        const profile = await syncUser(newSession.user);
                        if (mounted) {
                            setUser(profile);
                        }
                    } catch (err) {
                        console.error("[AuthContext] Error during onAuthStateChange sync:", err);
                    } finally {
                        if (mounted) {
                            setLoading(false);
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                } else {
                    // For INITIAL_SESSION or when Supabase client has no remote session,
                    // check whether an active local dev session exists before clearing.
                    const existingDevSession = await authService.getSession();
                    if (!existingDevSession) {
                        setSession(null);
                        setUser(null);
                    }
                    if (mounted) {
                        setLoading(false);
                    }
                }
            }
        );

        const handleUnauthorized = async () => {
            console.warn("[AuthContext] Received 401 Unauthorized event from API. Validating session state...");
            try {
                const activeSession = await authService.getSession();
                if (!activeSession) {
                    setSession(null);
                    setUser(null);
                }
            } catch (err) {
                setSession(null);
                setUser(null);
            }
        };

        window.addEventListener("hirehub:unauthorized", handleUnauthorized);

        return () => {
            mounted = false;
            subscription?.unsubscribe();
            window.removeEventListener("hirehub:unauthorized", handleUnauthorized);
        };
    }, []);

    const signIn = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await authService.signIn({ email, password });
            setSession(data.session);
            if (data.user) {
                const profile = await syncUser(data.user);
                setUser(profile);
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async ({ email, password, fullName, role = "CANDIDATE", phone = "" }) => {
        setLoading(true);
        try {
            const data = await authService.signUp({ email, password, fullName, role, phone });
            if (data.session) {
                setSession(data.session);
                if (data.user) {
                    const profile = await syncUser(data.user);
                    setUser(profile);
                }
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await authService.signOut();
            setSession(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (email, customRedirectUrl) => {
        return await authService.resetPassword(email, customRedirectUrl);
    };

    const updatePassword = async (newPassword) => {
        return await authService.updatePassword(newPassword);
    };

    // Role is strictly governed by the backend database user profile
    const role = (user?.role || "").toUpperCase();

    const getDashboardPath = (customRole = role) => {
        const r = (customRole || role || "").toUpperCase();
        if (r === 'RECRUITER') return '/recruiter/dashboard';
        if (r === 'ADMIN') return '/admin/dashboard';
        return '/candidate/dashboard';
    };

    const hasRole = (allowedRoles) => {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        if (!user?.role) return false;
        return allowedRoles.map(r => r.toUpperCase()).includes(user.role.toUpperCase());
    };

    const profileData = user ? {
        ...user,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User',
        role: (user.role || 'CANDIDATE').toUpperCase(),
    } : null;

    const switchRole = async (targetRole) => {
        const normalizedRole = (targetRole || 'CANDIDATE').toUpperCase();
        const email = `${normalizedRole.toLowerCase()}@hirehub.ai`;
        return await signIn({ email, password: 'password123' });
    };

    const value = {
        session,
        user,
        profile: profileData,
        role,
        loading,
        isInitializing,
        isAuthenticated: !!session,
        hasRole,
        getDashboardPath,
        signIn,
        login: (email, password) => signIn({ email, password }),
        signUp,
        signup: (userData) => signUp(userData),
        signOut,
        logout: signOut,
        switchRole,
        resetPassword,
        updatePassword,
        resendVerificationEmail: (email) => authService.resendVerificationEmail(email),
        refreshUser: () => session?.user && syncUser(session.user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}

export default AuthContext;
