import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import CandidateLayout from "../layouts/CandidateLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";
import AdminLayout from "../layouts/AdminLayout";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { SkeletonLoader } from "../components/common/SkeletonLoader";

// Public Pages (Eagerly loaded for fast first contentful paint)
import HomePage from "../pages/public/HomePage";
import JobsPage from "../pages/public/JobsPage";
import JobDetailsPage from "../pages/public/JobDetailsPage";
import CompanyDetailsPage from "../pages/public/CompanyDetailsPage";
import SalaryInsightsPage from "../pages/public/SalaryInsightsPage";
import PublicCandidateProfilePage from "../pages/public/PublicCandidateProfilePage";
import NotFoundPage from "../pages/public/NotFoundPage";
import UnauthorizedPage from "../pages/public/UnauthorizedPage";
import ScrollToTop from "../components/common/ScrollToTop";

// Public Informational Pages (Lazy-loaded)
const AboutPage = lazy(() => import("../pages/public/AboutPage"));
const HelpSupportPage = lazy(() => import("../pages/public/HelpSupportPage"));
const SupportPage = lazy(() => import("../pages/support/SupportPage"));
const SupportTicketDetailsPage = lazy(() => import("../pages/support/SupportTicketDetailsPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/public/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("../pages/public/TermsOfServicePage"));

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import AuthCallbackPage from "../pages/auth/AuthCallbackPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";

// Candidate Pages (Lazy-loaded chunks)
const CandidateDashboardPage = lazy(() => import("../pages/candidate/CandidateDashboardPage"));
const CandidateProfilePage = lazy(() => import("../pages/candidate/CandidateProfilePage"));
const CandidateApplicationsPage = lazy(() => import("../pages/candidate/CandidateApplicationsPage"));
const CandidateSavedJobsPage = lazy(() => import("../pages/candidate/CandidateSavedJobsPage"));
const CandidateAiToolsPage = lazy(() => import("../pages/candidate/CandidateAiToolsPage"));
const CandidateInterviewsPage = lazy(() => import("../pages/candidate/CandidateInterviewsPage"));
const CandidateAssessmentsPage = lazy(() => import("../pages/candidate/CandidateAssessmentsPage"));

// Recruiter Pages (Lazy-loaded chunks)
const RecruiterDashboardPage = lazy(() => import("../pages/recruiter/RecruiterDashboardPage"));
const RecruiterProfilePage = lazy(() => import("../pages/recruiter/RecruiterProfilePage"));
const RecruiterJobsPage = lazy(() => import("../pages/recruiter/RecruiterJobsPage"));
const CreateJobPage = lazy(() => import("../pages/recruiter/CreateJobPage"));
const RecruiterApplicantsPage = lazy(() => import("../pages/recruiter/RecruiterApplicantsPage"));
const CandidateSearchPage = lazy(() => import("../pages/recruiter/CandidateSearchPage"));
const RecruiterInterviewsPage = lazy(() => import("../pages/recruiter/RecruiterInterviewsPage"));
const CompanyProfilePage = lazy(() => import("../pages/recruiter/CompanyProfilePage"));
const RecruiterAiToolsPage = lazy(() => import("../pages/recruiter/RecruiterAiToolsPage"));

// Admin Pages (Lazy-loaded chunks)
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminCompaniesPage = lazy(() => import("../pages/admin/AdminCompaniesPage"));
const AdminJobsModerationPage = lazy(() => import("../pages/admin/AdminJobsModerationPage"));
const AdminApplicationsPage = lazy(() => import("../pages/admin/AdminApplicationsPage"));
const AdminNotificationsPage = lazy(() => import("../pages/admin/AdminNotificationsPage"));
const AdminAnalyticsPage = lazy(() => import("../pages/admin/AdminAnalyticsPage"));
const AdminSupportPage = lazy(() => import("../pages/admin/AdminSupportPage"));
const ApiIntegrationTestPage = lazy(() => import("../pages/admin/ApiIntegrationTestPage"));

// Shared Pages
const NotificationsPage = lazy(() => import("../pages/common/NotificationsPage"));
const MessagesPage = lazy(() => import("../pages/common/MessagesPage"));

export function AppRouter() {
    const suspenseFallback = (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <SkeletonLoader count={3} variant="card" />
        </div>
    );

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={suspenseFallback}>
                <Routes>
                {/* Public Routes wrapped in MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/:id" element={<JobDetailsPage />} />
                    <Route path="/companies" element={<CompanyDetailsPage />} />
                    <Route path="/companies/:id" element={<CompanyDetailsPage />} />
                    <Route path="/salaries" element={<SalaryInsightsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/help" element={<HelpSupportPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/candidates/:id" element={<PublicCandidateProfilePage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/api-test" element={<div style={{ padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}><ApiIntegrationTestPage /></div>} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    {/* Authenticated Help & Support Center (Any authenticated role: Candidate, Recruiter, Admin) */}
                    <Route element={<ProtectedRoute allowedRoles={["CANDIDATE", "RECRUITER", "ADMIN"]} />}>
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/support/tickets/:ticketId" element={<SupportTicketDetailsPage />} />
                    </Route>

                    {/* Guest-only routes: redirect to role portal if already authenticated */}
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                    </Route>
                </Route>

                {/* Candidate Protected Routes (Role-Based RBAC) */}
                <Route element={<ProtectedRoute allowedRoles={["CANDIDATE", "ADMIN"]} />}>
                    <Route path="/candidate" element={<CandidateLayout />}>
                        <Route index element={<CandidateDashboardPage />} />
                        <Route path="dashboard" element={<CandidateDashboardPage />} />
                        <Route path="profile" element={<CandidateProfilePage />} />
                        <Route path="resume" element={<CandidateProfilePage defaultTab="resumes" />} />
                        <Route path="jobs" element={<JobsPage />} />
                        <Route path="applications" element={<CandidateApplicationsPage />} />
                        <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
                        <Route path="assessments" element={<CandidateAssessmentsPage />} />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route path="interviews" element={<CandidateInterviewsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="ai" element={<CandidateAiToolsPage />} />
                        <Route path="ai-tools" element={<CandidateAiToolsPage />} />
                    </Route>
                </Route>

                {/* Recruiter Protected Routes (Role-Based RBAC) */}
                <Route element={<ProtectedRoute allowedRoles={["RECRUITER", "ADMIN"]} />}>
                    <Route path="/recruiter" element={<RecruiterLayout />}>
                        <Route index element={<RecruiterDashboardPage />} />
                        <Route path="dashboard" element={<RecruiterDashboardPage />} />
                        <Route path="profile" element={<RecruiterProfilePage />} />
                        <Route path="company" element={<CompanyProfilePage />} />
                        <Route path="jobs" element={<RecruiterJobsPage />} />
                        <Route path="jobs/new" element={<CreateJobPage />} />
                        <Route path="jobs/:id/edit" element={<CreateJobPage />} />
                        <Route path="jobs/:id/applicants" element={<RecruiterApplicantsPage />} />
                        <Route path="candidates" element={<CandidateSearchPage />} />
                        <Route path="applications" element={<RecruiterApplicantsPage />} />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route path="interviews" element={<RecruiterInterviewsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="ai" element={<RecruiterAiToolsPage />} />
                        <Route path="ai-tools" element={<RecruiterAiToolsPage />} />
                    </Route>
                </Route>

                {/* Admin Protected Routes (Role-Based RBAC) */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="candidates" element={<AdminUsersPage filterRole="CANDIDATE" />} />
                        <Route path="recruiters" element={<AdminUsersPage filterRole="RECRUITER" />} />
                        <Route path="companies" element={<AdminCompaniesPage />} />
                        <Route path="jobs" element={<AdminJobsModerationPage />} />
                        <Route path="jobs/moderation" element={<AdminJobsModerationPage />} />
                        <Route path="applications" element={<AdminApplicationsPage />} />
                        <Route path="broadcast" element={<AdminNotificationsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="analytics" element={<AdminAnalyticsPage />} />
                        <Route path="support" element={<AdminSupportPage />} />
                        <Route path="api-test" element={<ApiIntegrationTestPage />} />
                    </Route>
                </Route>

                {/* 404 Catch-All Page wrapped in MainLayout */}
                <Route element={<MainLayout />}>
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default AppRouter;
