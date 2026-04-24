CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    must_total_score INTEGER NOT NULL DEFAULT 0
        CHECK (must_total_score >= 0 AND must_total_score <= 6),
    must_risk_category VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (must_risk_category IN ('low', 'medium', 'high', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed MUST nutritional screening grading result. Total score 0 = low risk, 1 = medium risk, >=2 = high risk. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.must_total_score IS
    'MUST total score (sum of steps 1-3), range 0-6.';
COMMENT ON COLUMN grading_result.must_risk_category IS
    'MUST risk category: low (score 0), medium (score 1), high (score >=2), or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall nutritional risk level incorporating all assessment factors: low, moderate, high, critical, or empty.';
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
