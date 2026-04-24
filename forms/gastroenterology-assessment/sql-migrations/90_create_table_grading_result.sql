CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    severity_score INTEGER NOT NULL DEFAULT 0
        CHECK (severity_score >= 0),
    severity_level VARCHAR(10) NOT NULL DEFAULT 'mild'
        CHECK (severity_level IN ('mild', 'moderate', 'severe')),
    red_flag_count INTEGER NOT NULL DEFAULT 0
        CHECK (red_flag_count >= 0),
    urgent_referral_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed GI Symptom Severity Score grading result for gastroenterology assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.severity_score IS
    'Composite GI symptom severity score.';
COMMENT ON COLUMN grading_result.severity_level IS
    'Overall severity classification: mild, moderate, or severe.';
COMMENT ON COLUMN grading_result.red_flag_count IS
    'Number of red flag symptoms detected.';
COMMENT ON COLUMN grading_result.urgent_referral_recommended IS
    'Whether urgent specialist referral is recommended based on red flags.';
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
