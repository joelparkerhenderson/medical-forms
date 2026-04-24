CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    right_pta_db NUMERIC(5,1),
    left_pta_db NUMERIC(5,1),
    better_ear_pta_db NUMERIC(5,1),
    right_hearing_grade VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (right_hearing_grade IN ('normal', 'mild', 'moderate', 'moderately_severe', 'severe', 'profound')),
    left_hearing_grade VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (left_hearing_grade IN ('normal', 'mild', 'moderate', 'moderately_severe', 'severe', 'profound')),
    overall_hearing_grade VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (overall_hearing_grade IN ('normal', 'mild', 'moderate', 'moderately_severe', 'severe', 'profound')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed hearing level grading result based on pure tone average (PTA). Normal (<=25 dB), Mild (26-40 dB), Moderate (41-55 dB), Moderately Severe (56-70 dB), Severe (71-90 dB), Profound (>90 dB). One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.right_pta_db IS
    'Right ear pure tone average in dB HL, NULL if not tested.';
COMMENT ON COLUMN grading_result.left_pta_db IS
    'Left ear pure tone average in dB HL, NULL if not tested.';
COMMENT ON COLUMN grading_result.better_ear_pta_db IS
    'Better ear pure tone average in dB HL, NULL if not tested.';
COMMENT ON COLUMN grading_result.right_hearing_grade IS
    'Right ear hearing level grade: normal, mild, moderate, moderately_severe, severe, or profound.';
COMMENT ON COLUMN grading_result.left_hearing_grade IS
    'Left ear hearing level grade: normal, mild, moderate, moderately_severe, severe, or profound.';
COMMENT ON COLUMN grading_result.overall_hearing_grade IS
    'Overall hearing level grade based on the better ear PTA.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the hearing level grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
