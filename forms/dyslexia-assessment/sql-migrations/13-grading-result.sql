-- 13_grading_result.sql
-- Stores the computed dyslexia severity grading result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    severity_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('none', 'mild', 'moderate', 'severe', '')),
    lowest_domain_score INTEGER
        CHECK (lowest_domain_score IS NULL OR (lowest_domain_score >= 40 AND lowest_domain_score <= 160)),
    lowest_domain_name VARCHAR(100) NOT NULL DEFAULT '',
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed dyslexia severity grading result. Severity: none (85-115), mild (70-84), moderate (55-69), severe (<55). One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.severity_level IS
    'Dyslexia severity level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN grading_result.lowest_domain_score IS
    'The lowest standardised score across all assessed domains.';
COMMENT ON COLUMN grading_result.lowest_domain_name IS
    'Name of the domain with the lowest standardised score.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
