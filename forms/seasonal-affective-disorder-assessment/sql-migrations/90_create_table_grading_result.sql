CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    gss_total INTEGER NOT NULL DEFAULT 0
        CHECK (gss_total >= 0 AND gss_total <= 24),
    gss_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (gss_category IN ('no-sad', 'subsyndromal', 'sad-likely', '')),
    phq9_total INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_total >= 0 AND phq9_total <= 27),
    phq9_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (phq9_severity IN ('minimal', 'mild', 'moderate', 'moderately-severe', 'severe', '')),
    combined_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (combined_severity IN ('no-sad', 'mild', 'moderate', 'severe', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed SAD grading result. SPAQ GSS 0-24, PHQ-9 0-27, combined severity. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.gss_total IS
    'SPAQ Global Seasonality Score total (0-24).';
COMMENT ON COLUMN grading_result.gss_category IS
    'GSS category: no-sad (0-7), subsyndromal (8-10), sad-likely (11-24), or empty.';
COMMENT ON COLUMN grading_result.phq9_total IS
    'PHQ-9 total score (0-27).';
COMMENT ON COLUMN grading_result.phq9_severity IS
    'PHQ-9 severity: minimal (0-4), mild (5-9), moderate (10-14), moderately-severe (15-19), severe (20-27), or empty.';
COMMENT ON COLUMN grading_result.combined_severity IS
    'Combined severity integrating GSS and PHQ-9: no-sad, mild, moderate, severe, critical, or empty.';
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
