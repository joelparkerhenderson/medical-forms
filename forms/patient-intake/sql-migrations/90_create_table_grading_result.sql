CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    risk_level VARCHAR(10) NOT NULL DEFAULT 'low'
        CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_factor_count INTEGER NOT NULL DEFAULT 0
        CHECK (risk_factor_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed risk level grading result for the patient intake assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.risk_level IS
    'Overall risk level: low (minimal risk factors), medium (some risk factors), high (significant risk factors requiring attention).';
COMMENT ON COLUMN grading_result.risk_factor_count IS
    'Total number of risk factors identified during intake.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the risk grading was computed.';

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
