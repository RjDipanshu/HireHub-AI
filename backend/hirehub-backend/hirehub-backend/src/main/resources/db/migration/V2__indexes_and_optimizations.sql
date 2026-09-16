-- =============================================================================
-- HireHub AI - V2 Indexes and Query Optimizations
-- High-Performance Composite & Foreign Key Indexes
-- =============================================================================

-- 1. Users & Authentication Indexes
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status);

-- 2. Companies
CREATE INDEX IF NOT EXISTS idx_companies_recruiter_id ON companies(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- 3. Candidate Profiles & Profile Sections
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_educations_candidate_id ON educations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_experiences_candidate_id ON experiences(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill_id ON candidate_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_certifications_candidate_id ON certifications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resumes_primary ON resumes(candidate_id, is_primary);

-- 4. Jobs & Filter Optimization
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_filter ON jobs(status, job_type, experience_level, work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);

-- 5. Applications & Pipeline
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON job_applications(job_id, status);

-- 6. Interviews
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter_id ON interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- 7. Notifications & Unread Performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
