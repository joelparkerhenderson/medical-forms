-- 04_assessment_statement_context.sql
-- Statement context section of the advance statement about care.

CREATE TABLE assessment_statement_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reason_for_statement TEXT NOT NULL DEFAULT '',
    current_health_status TEXT NOT NULL DEFAULT '',
    current_diagnoses TEXT NOT NULL DEFAULT '',
    has_discussed_with_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_discussed_with_family IN ('yes', 'no', '')),
    has_discussed_with_clinician VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_discussed_with_clinician IN ('yes', 'no', '')),
    discussion_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_statement_context_updated_at
    BEFORE UPDATE ON assessment_statement_context
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_statement_context IS
    'Statement context section: why the person is making this advance statement and their current health context. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_statement_context.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_statement_context.reason_for_statement IS
    'Free-text reason for creating this advance statement.';
COMMENT ON COLUMN assessment_statement_context.current_health_status IS
    'Description of current overall health status.';
COMMENT ON COLUMN assessment_statement_context.current_diagnoses IS
    'Current medical diagnoses relevant to future care planning.';
COMMENT ON COLUMN assessment_statement_context.has_discussed_with_family IS
    'Whether the person has discussed this statement with family members.';
COMMENT ON COLUMN assessment_statement_context.has_discussed_with_clinician IS
    'Whether the person has discussed this statement with a healthcare professional.';
COMMENT ON COLUMN assessment_statement_context.discussion_details IS
    'Details of discussions held with family or clinicians about this statement.';
