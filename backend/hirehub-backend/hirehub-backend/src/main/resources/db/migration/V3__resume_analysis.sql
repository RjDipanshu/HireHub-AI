-- =============================================================================
-- HireHub AI - V3 Resume Analysis Schema & Storage
-- Supports 1.0 AI Resume Analyzer with Structured Intelligence
-- =============================================================================

CREATE TABLE IF NOT EXISTS resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    overall_score INT NOT NULL DEFAULT 0,
    summary TEXT,
    technical_skills TEXT,
    soft_skills TEXT,
    education_json TEXT,
    experience_json TEXT,
    projects_json TEXT,
    certifications_json TEXT,
    keywords_json TEXT,
    strengths_json TEXT,
    weaknesses_json TEXT,
    missing_skills_json TEXT,
    formatting_issues_json TEXT,
    ats_compatibility_issues_json TEXT,
    suggestions_json TEXT,
    model_used VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_analyses_resume_id ON resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_candidate_id ON resume_analyses(candidate_id);
