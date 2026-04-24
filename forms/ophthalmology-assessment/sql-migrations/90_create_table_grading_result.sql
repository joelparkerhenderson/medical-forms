CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    visual_acuity_grade VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (visual_acuity_grade IN ('normal', 'mild-impairment', 'moderate-impairment', 'severe-impairment', 'near-blindness', 'blindness', '')),
    best_corrected_va_right VARCHAR(20) NOT NULL DEFAULT '',
    best_corrected_va_left VARCHAR(20) NOT NULL DEFAULT '',
    better_eye_va VARCHAR(20) NOT NULL DEFAULT '',
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed visual acuity grading result for the ophthalmology assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.visual_acuity_grade IS
    'Overall visual acuity grade: normal, mild-impairment, moderate-impairment, severe-impairment, near-blindness, blindness, or empty.';
COMMENT ON COLUMN grading_result.best_corrected_va_right IS
    'Best corrected visual acuity of the right eye used for grading.';
COMMENT ON COLUMN grading_result.best_corrected_va_left IS
    'Best corrected visual acuity of the left eye used for grading.';
COMMENT ON COLUMN grading_result.better_eye_va IS
    'Visual acuity of the better eye used for overall grading.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the visual acuity grading was computed.';

COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
