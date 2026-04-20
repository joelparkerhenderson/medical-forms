-- 13_grading_result.sql
-- Stores the computed substance abuse grading result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    audit_score INTEGER
        CHECK (audit_score IS NULL OR (audit_score >= 0 AND audit_score <= 40)),
    audit_risk_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (audit_risk_category IN ('low-risk', 'hazardous', 'harmful', 'dependence-likely', '')),
    dast_score INTEGER
        CHECK (dast_score IS NULL OR (dast_score >= 0 AND dast_score <= 10)),
    dast_risk_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dast_risk_category IN ('no-problems', 'low', 'moderate', 'substantial', 'severe', '')),
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
    'Computed substance abuse grading result. AUDIT score 0-40, DAST-10 score 0-10, and combined risk level. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.audit_score IS
    'AUDIT total score (0-40).';
COMMENT ON COLUMN grading_result.audit_risk_category IS
    'AUDIT risk category: low-risk, hazardous, harmful, dependence-likely, or empty.';
COMMENT ON COLUMN grading_result.dast_score IS
    'DAST-10 total score (0-10).';
COMMENT ON COLUMN grading_result.dast_risk_category IS
    'DAST risk category: no-problems, low, moderate, substantial, severe, or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall substance abuse risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
