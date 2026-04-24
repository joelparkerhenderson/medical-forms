CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nihss_total_score INTEGER NOT NULL DEFAULT 0
        CHECK (nihss_total_score >= 0 AND nihss_total_score <= 42),
    nihss_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (nihss_severity IN ('no_stroke_symptoms', 'minor', 'moderate', 'moderate_to_severe', 'severe', '')),
    modified_rankin_score INTEGER
        CHECK (modified_rankin_score IS NULL OR (modified_rankin_score >= 0 AND modified_rankin_score <= 6)),
    barthel_index INTEGER
        CHECK (barthel_index IS NULL OR (barthel_index >= 0 AND barthel_index <= 100)),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed NIHSS grading result for the neurology assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.nihss_total_score IS
    'NIHSS total score (0-42).';
COMMENT ON COLUMN grading_result.nihss_severity IS
    'NIHSS severity: no_stroke_symptoms (0), minor (1-4), moderate (5-15), moderate_to_severe (16-20), severe (21-42).';
COMMENT ON COLUMN grading_result.modified_rankin_score IS
    'Modified Rankin Scale score (0-6) at time of grading.';
COMMENT ON COLUMN grading_result.barthel_index IS
    'Barthel Index (0-100) at time of grading.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
