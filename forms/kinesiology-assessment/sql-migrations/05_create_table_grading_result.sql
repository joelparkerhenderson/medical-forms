CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    total_fms_score INTEGER NOT NULL DEFAULT 0
        CHECK (total_fms_score >= 0 AND total_fms_score <= 21),
    risk_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (risk_category IN ('increased_injury_risk', 'moderate_risk', 'low_risk', '')),
    asymmetry_count INTEGER NOT NULL DEFAULT 0
        CHECK (asymmetry_count >= 0),
    pain_count INTEGER NOT NULL DEFAULT 0
        CHECK (pain_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed FMS grading result for the kinesiology assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.total_fms_score IS
    'Total Functional Movement Screen score (0-21, sum of 7 movement test final scores).';
COMMENT ON COLUMN grading_result.risk_category IS
    'Injury risk category: increased_injury_risk (0-14), moderate_risk (15-17), low_risk (18-21).';
COMMENT ON COLUMN grading_result.asymmetry_count IS
    'Number of bilateral tests showing left-right score asymmetry.';
COMMENT ON COLUMN grading_result.pain_count IS
    'Number of movement tests where pain was noted or clearing tests were positive.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
