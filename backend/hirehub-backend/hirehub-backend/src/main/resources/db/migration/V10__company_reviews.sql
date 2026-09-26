-- =============================================================================
-- HireHub AI - V10 Company Reviews & Ratings (Glassdoor / AmbitionBox style)
-- =============================================================================

CREATE TABLE IF NOT EXISTS company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(150),
    job_title VARCHAR(150),
    employment_status VARCHAR(50) DEFAULT 'CURRENT_EMPLOYEE',
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    work_life_balance NUMERIC(2,1) CHECK (work_life_balance >= 1.0 AND work_life_balance <= 5.0),
    culture_values NUMERIC(2,1) CHECK (culture_values >= 1.0 AND culture_values <= 5.0),
    career_growth NUMERIC(2,1) CHECK (career_growth >= 1.0 AND career_growth <= 5.0),
    compensation_benefits NUMERIC(2,1) CHECK (compensation_benefits >= 1.0 AND compensation_benefits <= 5.0),
    review_title VARCHAR(200) NOT NULL,
    pros TEXT NOT NULL,
    cons TEXT NOT NULL,
    advice_to_management TEXT,
    is_recommended BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON company_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_rating ON company_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_company_reviews_created_at ON company_reviews(created_at DESC);
