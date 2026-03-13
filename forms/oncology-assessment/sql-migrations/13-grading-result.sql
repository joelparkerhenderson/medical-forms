-- 13_grading_result.sql
-- Stores the computed ECOG grading result for an oncology assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ecog_score INTEGER NOT NULL DEFAULT 0
        CHECK (ecog_score >= 0 AND ecog_score <= 5),
    ecog_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (ecog_category IN ('fully-active', 'restricted', 'ambulatory', 'limited-self-care', 'completely-disabled', 'dead', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed ECOG Performance Status grading result for the oncology assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.ecog_score IS
    'ECOG Performance Status score: 0 = Fully active, 1 = Restricted, 2 = Ambulatory, 3 = Limited self-care, 4 = Completely disabled, 5 = Dead.';
COMMENT ON COLUMN grading_result.ecog_category IS
    'ECOG category label: fully-active, restricted, ambulatory, limited-self-care, completely-disabled, dead, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the ECOG grading was computed.';
