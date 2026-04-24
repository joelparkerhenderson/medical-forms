CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    normalized_score NUMERIC(5,1) NOT NULL DEFAULT 0
        CHECK (normalized_score >= 0 AND normalized_score <= 100),
    satisfaction_category VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (satisfaction_category IN ('excellent', 'good', 'satisfactory', 'poor', 'very-poor', '')),
    domain_access_score NUMERIC(5,1)
        CHECK (domain_access_score IS NULL OR (domain_access_score >= 0 AND domain_access_score <= 100)),
    domain_communication_score NUMERIC(5,1)
        CHECK (domain_communication_score IS NULL OR (domain_communication_score >= 0 AND domain_communication_score <= 100)),
    domain_clinical_care_score NUMERIC(5,1)
        CHECK (domain_clinical_care_score IS NULL OR (domain_clinical_care_score >= 0 AND domain_clinical_care_score <= 100)),
    domain_staff_score NUMERIC(5,1)
        CHECK (domain_staff_score IS NULL OR (domain_staff_score >= 0 AND domain_staff_score <= 100)),
    domain_environment_score NUMERIC(5,1)
        CHECK (domain_environment_score IS NULL OR (domain_environment_score >= 0 AND domain_environment_score <= 100)),
    domain_discharge_score NUMERIC(5,1)
        CHECK (domain_discharge_score IS NULL OR (domain_discharge_score >= 0 AND domain_discharge_score <= 100)),
    domain_overall_score NUMERIC(5,1)
        CHECK (domain_overall_score IS NULL OR (domain_overall_score >= 0 AND domain_overall_score <= 100)),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed satisfaction grading result. Normalized score 0-100 with domain sub-scores. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.normalized_score IS
    'Overall normalized satisfaction score (0-100).';
COMMENT ON COLUMN grading_result.satisfaction_category IS
    'Satisfaction category: excellent, good, satisfactory, poor, very-poor, or empty.';
COMMENT ON COLUMN grading_result.domain_access_score IS
    'Normalized score for access and waiting times domain (0-100).';
COMMENT ON COLUMN grading_result.domain_communication_score IS
    'Normalized score for communication and information domain (0-100).';
COMMENT ON COLUMN grading_result.domain_clinical_care_score IS
    'Normalized score for clinical care quality domain (0-100).';
COMMENT ON COLUMN grading_result.domain_staff_score IS
    'Normalized score for staff attitude domain (0-100).';
COMMENT ON COLUMN grading_result.domain_environment_score IS
    'Normalized score for environment and facilities domain (0-100).';
COMMENT ON COLUMN grading_result.domain_discharge_score IS
    'Normalized score for discharge and follow-up domain (0-100).';
COMMENT ON COLUMN grading_result.domain_overall_score IS
    'Normalized score for overall experience domain (0-100).';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
