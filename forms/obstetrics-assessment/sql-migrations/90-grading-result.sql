-- 90-grading-result.sql
-- Stores the computed grading / scoring result for this assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    result_category VARCHAR(100) NOT NULL DEFAULT '',
    result_score NUMERIC,
    result_notes TEXT NOT NULL DEFAULT '',
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS 'Computed grading / scoring result. One-to-one child of assessment. The result_category column holds a form-specific label (e.g. Low, Moderate, High, or Complete/Incomplete); result_score is optional for numeric instruments.';
COMMENT ON COLUMN grading_result.assessment_id IS 'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.result_category IS 'Form-specific outcome label.';
COMMENT ON COLUMN grading_result.result_score IS 'Optional numeric score for quantitative instruments.';
COMMENT ON COLUMN grading_result.result_notes IS 'Free-text clinician notes accompanying the result.';
COMMENT ON COLUMN grading_result.graded_at IS 'Timestamp when the grading was computed.';
