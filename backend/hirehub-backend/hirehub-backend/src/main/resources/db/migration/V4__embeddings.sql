-- =============================================================================
-- HireHub AI - V4 Embeddings & Semantic Search Engine
-- Supports Phase 11.0, 12.0 & 13.0
-- Vector Embeddings for Resumes, Jobs, Candidate Profiles, and Skills
-- =============================================================================

-- 1. Enable pgvector if available
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding vectors to target tables
DO $$
BEGIN
    -- Check if pgvector is available
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
        -- Add vector column for jobs
        ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(768);
        -- Add vector column for candidate profiles
        ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS embedding vector(768);
        -- Add vector column for resumes
        ALTER TABLE resumes ADD COLUMN IF NOT EXISTS embedding vector(768);
        -- Add vector column for skills
        ALTER TABLE skills ADD COLUMN IF NOT EXISTS embedding vector(768);

        -- Create HNSW or IVFFlat indexes if possible
        CREATE INDEX IF NOT EXISTS idx_jobs_embedding ON jobs USING hnsw (embedding vector_cosine_ops);
        CREATE INDEX IF NOT EXISTS idx_candidate_profiles_embedding ON candidate_profiles USING hnsw (embedding vector_cosine_ops);
        CREATE INDEX IF NOT EXISTS idx_resumes_embedding ON resumes USING hnsw (embedding vector_cosine_ops);
    ELSE
        -- Fallback: If pgvector is not natively loaded, store JSON embeddings array
        ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding_json TEXT;
        ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS embedding_json TEXT;
        ALTER TABLE resumes ADD COLUMN IF NOT EXISTS embedding_json TEXT;
        ALTER TABLE skills ADD COLUMN IF NOT EXISTS embedding_json TEXT;
    END IF;
END $$;
