CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    dash_score NUMERIC(5,1) NOT NULL DEFAULT 0
        CHECK (dash_score >= 0 AND dash_score <= 100),
    disability_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (disability_category IN ('none', 'mild', 'moderate', 'severe', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed DASH grading result for the orthopedic assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.dash_score IS
    'DASH score: 0 = no disability, 100 = most severe disability.';
COMMENT ON COLUMN grading_result.disability_category IS
    'Disability category: none (0), mild (1-33), moderate (34-66), severe (67-100), or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the DASH grading was computed.';

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
