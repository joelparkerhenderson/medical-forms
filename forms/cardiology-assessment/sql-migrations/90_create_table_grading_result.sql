CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    ccs_angina_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ccs_angina_class IN ('I', 'II', 'III', 'IV', '')),
    nyha_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nyha_class IN ('I', 'II', 'III', 'IV', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed cardiac classification grading result. CCS Angina Class I-IV and NYHA Heart Failure Class I-IV. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.ccs_angina_class IS
    'Canadian Cardiovascular Society angina classification: I, II, III, IV, or empty.';
COMMENT ON COLUMN grading_result.nyha_class IS
    'New York Heart Association functional classification: I, II, III, IV, or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall cardiovascular risk level: low, moderate, high, critical, or empty.';
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
