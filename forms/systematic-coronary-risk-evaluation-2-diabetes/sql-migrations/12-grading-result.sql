-- 12_grading_result.sql
-- Stores the computed risk grading result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    risk_category VARCHAR(20) NOT NULL DEFAULT 'low'
        CHECK (risk_category IN ('low', 'moderate', 'high', 'veryHigh')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed SCORE2-Diabetes risk grading result. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.risk_category IS
    'Overall risk classification: low, moderate, high, or veryHigh.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
