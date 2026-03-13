-- 12_grading_result.sql
-- Stores the computed severity grading result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    severity_level VARCHAR(10) NOT NULL DEFAULT 'mild'
        CHECK (severity_level IN ('mild', 'moderate', 'severe')),
    allergy_burden_score INTEGER NOT NULL DEFAULT 0
        CHECK (allergy_burden_score >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed allergy severity grading result. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.severity_level IS
    'Overall severity classification: mild, moderate, or severe.';
COMMENT ON COLUMN grading_result.allergy_burden_score IS
    'Weighted allergy burden score across all allergen categories.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
