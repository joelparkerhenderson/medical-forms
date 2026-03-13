-- 11_review_calculate.sql
-- Clinician review details and AUDIT score.

CREATE TABLE review_calculate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    review_date DATE,
    clinical_notes TEXT NOT NULL DEFAULT '',
    audit_score SMALLINT
        CHECK (audit_score IS NULL OR (audit_score >= 0 AND audit_score <= 40)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_review_calculate_updated_at
    BEFORE UPDATE ON review_calculate
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE review_calculate IS
    'Clinician review information and AUDIT alcohol screening score.';
COMMENT ON COLUMN review_calculate.clinician_name IS
    'Name of the reviewing clinician.';
COMMENT ON COLUMN review_calculate.review_date IS
    'Date of the clinical review.';
COMMENT ON COLUMN review_calculate.clinical_notes IS
    'Free-text clinical notes from the reviewing clinician.';
COMMENT ON COLUMN review_calculate.audit_score IS
    'AUDIT (Alcohol Use Disorders Identification Test) score (0-40).';
