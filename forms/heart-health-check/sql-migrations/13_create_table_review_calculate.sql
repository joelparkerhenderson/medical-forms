CREATE TABLE review_calculate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    review_date DATE,
    clinical_notes TEXT NOT NULL DEFAULT '',
    audit_score SMALLINT
        CHECK (audit_score IS NULL OR (audit_score >= 0 AND audit_score <= 40))
);

CREATE TRIGGER trigger_review_calculate_updated_at
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

COMMENT ON COLUMN review_calculate.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN review_calculate.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN review_calculate.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN review_calculate.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN review_calculate.deleted_at IS
    'Timestamp when this row was deleted.';
