CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    compliance_status VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (compliance_status IN ('fully-immunised', 'partially-immunised', 'non-compliant', 'contraindicated', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    childhood_complete VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childhood_complete IN ('yes', 'no', '')),
    occupational_complete VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_complete IN ('yes', 'no', 'not-required', '')),
    covid_complete VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (covid_complete IN ('yes', 'no', '')),
    flu_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flu_current IN ('yes', 'no', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed vaccination compliance grading result. Compliance status and risk level. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.compliance_status IS
    'Overall compliance: fully-immunised, partially-immunised, non-compliant, contraindicated, or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall vaccination risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.childhood_complete IS
    'Whether childhood immunisation schedule is complete: yes, no, or empty.';
COMMENT ON COLUMN grading_result.occupational_complete IS
    'Whether occupational vaccine requirements are met: yes, no, not-required, or empty.';
COMMENT ON COLUMN grading_result.covid_complete IS
    'Whether COVID-19 vaccination is up to date: yes, no, or empty.';
COMMENT ON COLUMN grading_result.flu_current IS
    'Whether current season flu vaccine has been received: yes, no, or empty.';
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
