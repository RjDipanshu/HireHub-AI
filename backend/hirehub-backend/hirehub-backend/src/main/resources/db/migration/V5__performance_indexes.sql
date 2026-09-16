-- =============================================================================
-- HireHub AI - V5 Production Query Performance Indexes
-- Phase 22.0: Soft-Delete Aware B-Tree Indexes & Pipeline Performance
-- =============================================================================

-- 1. Active & Non-Deleted Filter Indexes for High-Traffic Feeds
CREATE INDEX IF NOT EXISTS idx_jobs_active_non_deleted 
    ON jobs(status, is_deleted, created_at DESC) 
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_job_applications_pipeline 
    ON job_applications(job_id, status, is_deleted, created_at DESC) 
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_feed 
    ON job_applications(candidate_id, is_deleted, created_at DESC) 
    WHERE is_deleted = false;

-- 2. Candidate & Job Skills Optimization
CREATE INDEX IF NOT EXISTS idx_job_skills_composite 
    ON job_skills(job_id, skill_id, is_deleted) 
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_candidate_skills_composite 
    ON candidate_skills(candidate_id, skill_id, is_deleted) 
    WHERE is_deleted = false;

-- 3. Saved Jobs Quick Lookup
CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate 
    ON saved_jobs(candidate_id, is_deleted, created_at DESC) 
    WHERE is_deleted = false;

-- 4. Notification Unread Index with Soft-Delete Exclusion
CREATE INDEX IF NOT EXISTS idx_notifications_unread_fast 
    ON notifications(user_id, is_read, created_at DESC) 
    WHERE is_deleted = false;

-- 5. Interview Status & Schedule Index
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter_schedule 
    ON interviews(recruiter_id, status, scheduled_at ASC) 
    WHERE is_deleted = false;
