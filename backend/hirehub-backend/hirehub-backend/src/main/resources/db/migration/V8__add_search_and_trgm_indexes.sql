-- =============================================================================
-- HireHub AI - V8 Database Search & Query Scalability Optimizations
-- Phase 1: PostgreSQL pg_trgm & Full-Text Search GIN Indexes
-- =============================================================================

-- 1. Enable PostgreSQL Trigram Extension for High-Speed Substring Matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN Trigram Indexes for Instant Wildcard (LIKE / ILIKE '%keyword%') Searches
-- Accelerates fast autocomplete & search on job titles and company names across aggregated jobs
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm 
    ON jobs USING gin (title gin_trgm_ops) 
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_jobs_company_name_trgm 
    ON jobs USING gin (company_name gin_trgm_ops) 
    WHERE is_deleted = false;

-- 3. GIN Full-Text Search Index for Comprehensive Title & Description Searching
CREATE INDEX IF NOT EXISTS idx_jobs_fts_gin 
    ON jobs USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) 
    WHERE is_deleted = false;

-- 4. Marketplace Filter & Ordering Compound Index
CREATE INDEX IF NOT EXISTS idx_jobs_marketplace_feed 
    ON jobs(source_type, status, created_at DESC) 
    WHERE is_deleted = false;

-- 5. Candidate Skills Search Trigram Index
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm 
    ON skills USING gin (name gin_trgm_ops) 
    WHERE is_deleted = false;
