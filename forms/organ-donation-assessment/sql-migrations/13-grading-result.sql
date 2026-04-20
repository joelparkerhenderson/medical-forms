-- 13_grading_result.sql
-- Stores the computed organ donation eligibility grading result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    eligibility VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (eligibility IN ('suitable', 'conditionally-suitable', 'unsuitable', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    donor_risk_index NUMERIC(4,2),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed organ donation eligibility grading result. Eligibility: suitable, conditionally-suitable, unsuitable. Risk: low, moderate, high, critical. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.eligibility IS
    'Donor eligibility: suitable, conditionally-suitable, unsuitable, or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall donor risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.donor_risk_index IS
    'Calculated donor risk index score.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
