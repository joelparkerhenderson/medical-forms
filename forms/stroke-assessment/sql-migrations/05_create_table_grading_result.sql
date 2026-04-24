CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nihss_total_score INTEGER
        CHECK (nihss_total_score IS NULL OR (nihss_total_score >= 0 AND nihss_total_score <= 42)),
    stroke_severity VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (stroke_severity IN ('no_stroke_symptoms', 'minor', 'moderate', 'moderate_to_severe', 'severe', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed NIHSS stroke severity grading result. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.nihss_total_score IS
    'NIHSS total score (0-42); 0=no symptoms, 1-4=minor, 5-15=moderate, 16-20=moderate to severe, 21-42=severe.';
COMMENT ON COLUMN grading_result.stroke_severity IS
    'Stroke severity category: no_stroke_symptoms, minor, moderate, moderate_to_severe, severe, or empty string.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
