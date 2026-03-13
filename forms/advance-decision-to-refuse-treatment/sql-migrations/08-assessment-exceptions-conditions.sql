-- 08_assessment_exceptions_conditions.sql
-- Exceptions and conditions section of the advance decision to refuse treatment.

CREATE TABLE assessment_exceptions_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_exceptions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_exceptions IN ('yes', 'no', '')),
    exception_details TEXT NOT NULL DEFAULT '',
    pain_management_wishes TEXT NOT NULL DEFAULT '',
    comfort_care_wishes TEXT NOT NULL DEFAULT '',
    emergency_exception_details TEXT NOT NULL DEFAULT '',
    condition_specific_exceptions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_exceptions_conditions_updated_at
    BEFORE UPDATE ON assessment_exceptions_conditions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_exceptions_conditions IS
    'Exceptions and conditions section: situations or treatments excluded from the advance decision. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_exceptions_conditions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_exceptions_conditions.has_exceptions IS
    'Whether the person has specified any exceptions to the refusals.';
COMMENT ON COLUMN assessment_exceptions_conditions.exception_details IS
    'Details of any specific exceptions to the treatment refusals.';
COMMENT ON COLUMN assessment_exceptions_conditions.pain_management_wishes IS
    'Wishes regarding pain management and symptom relief despite treatment refusals.';
COMMENT ON COLUMN assessment_exceptions_conditions.comfort_care_wishes IS
    'Wishes regarding comfort care and palliative treatment.';
COMMENT ON COLUMN assessment_exceptions_conditions.emergency_exception_details IS
    'Any exceptions that apply in emergency or time-critical situations.';
COMMENT ON COLUMN assessment_exceptions_conditions.condition_specific_exceptions IS
    'Exceptions that apply to specific medical conditions or diagnoses.';
