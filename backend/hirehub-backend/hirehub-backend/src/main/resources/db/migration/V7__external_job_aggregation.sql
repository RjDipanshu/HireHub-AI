-- ====================================================================
-- HireHub AI — V7 External Job Aggregation & Unified Marketplace Schema
-- ====================================================================

-- 1. Extend jobs table with external ingestion metadata
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'HIREHUB';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_job_id VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_url VARCHAR(1000);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_posted_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS dedup_hash VARCHAR(64);

-- 2. MANDATORY: Unique constraint on (source_type, external_job_id) to prevent duplicate jobs
CREATE UNIQUE INDEX IF NOT EXISTS uq_jobs_source_external_id
ON jobs(source_type, external_job_id)
WHERE external_job_id IS NOT NULL;

-- 2b. Extend job_applications table with external tracking fields
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS application_source VARCHAR(50) DEFAULT 'HIREHUB';
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS external_job_id VARCHAR(255);
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS application_url VARCHAR(1000);
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 3. Performance indexes on unified jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_source_type ON jobs(source_type);
CREATE INDEX IF NOT EXISTS idx_jobs_dedup_hash ON jobs(dedup_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_active_source ON jobs(status, source_type);

-- 4. Job Sources configuration table
CREATE TABLE IF NOT EXISTS job_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR(100) NOT NULL UNIQUE,
    source_type VARCHAR(50) NOT NULL,
    base_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sync_interval_hours INT DEFAULT 6,
    last_sync_at TIMESTAMP WITHOUT TIME ZONE,
    last_sync_status VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 5. Job Sync Run history & telemetry table
CREATE TABLE IF NOT EXISTS job_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    jobs_found INT DEFAULT 0,
    jobs_imported INT DEFAULT 0,
    jobs_updated INT DEFAULT 0,
    jobs_skipped INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    duration_ms BIGINT DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_source ON job_sync_runs(source_type, started_at DESC);

-- 6. AI Job Match evaluation persistence table
CREATE TABLE IF NOT EXISTS job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score INT NOT NULL DEFAULT 0,
    skills_score INT NOT NULL DEFAULT 0,
    experience_score INT NOT NULL DEFAULT 0,
    location_score INT NOT NULL DEFAULT 0,
    missing_skills_json TEXT,
    matching_skills_json TEXT,
    match_rationale TEXT,
    evaluated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_matches_lookup ON job_matches(candidate_id, job_id);

-- 7. Seed default job sources
INSERT INTO job_sources (source_name, source_type, base_url, is_active, sync_interval_hours)
VALUES 
    ('Adzuna Jobs India', 'ADZUNA', 'https://api.adzuna.com/v1/api/jobs', TRUE, 6),
    ('Greenhouse ATS', 'GREENHOUSE', 'https://boards-api.greenhouse.io/v1/boards', TRUE, 6),
    ('Lever Postings', 'LEVER', 'https://api.lever.co/v0/postings', TRUE, 6)
ON CONFLICT (source_name) DO NOTHING;
