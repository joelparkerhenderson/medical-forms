CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    asrm_stage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asrm_stage IN ('I', 'II', 'III', 'IV', '')),
    asrm_points INTEGER
        CHECK (asrm_points IS NULL OR asrm_points >= 0),
    ehp30_total_score INTEGER
        CHECK (ehp30_total_score IS NULL OR (ehp30_total_score >= 0 AND ehp30_total_score <= 100)),
    overall_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_severity IN ('mild', 'moderate', 'severe', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed endometriosis staging and grading result. Revised ASRM Stage I-IV and EHP-30 quality of life score. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.asrm_stage IS
    'Revised ASRM endometriosis stage: I, II, III, IV, or empty.';
COMMENT ON COLUMN grading_result.asrm_points IS
    'Revised ASRM total points score.';
COMMENT ON COLUMN grading_result.ehp30_total_score IS
    'EHP-30 total quality of life score (0-100, higher = worse).';
COMMENT ON COLUMN grading_result.overall_severity IS
    'Overall endometriosis severity: mild, moderate, severe, critical, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
