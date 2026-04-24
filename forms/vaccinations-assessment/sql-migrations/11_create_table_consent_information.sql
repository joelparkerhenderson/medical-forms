CREATE TABLE consent_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    information_provided SMALLINT CHECK (information_provided IS NULL OR information_provided BETWEEN 1 AND 5),
    risks_explained SMALLINT CHECK (risks_explained IS NULL OR risks_explained BETWEEN 1 AND 5),
    benefits_explained SMALLINT CHECK (benefits_explained IS NULL OR benefits_explained BETWEEN 1 AND 5),
    questions_answered SMALLINT CHECK (questions_answered IS NULL OR questions_answered BETWEEN 1 AND 5),
    consent_given VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (consent_given IN ('yes', 'no', '')),
    consent_date DATE,
    guardian_consent VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (guardian_consent IN ('yes', 'no', 'notApplicable', ''))
);

CREATE TRIGGER trigger_consent_information_updated_at
    BEFORE UPDATE ON consent_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE consent_information IS
    'Consent quality scoring (1-5 Likert) and consent status. One-to-one child of assessment.';

COMMENT ON COLUMN consent_information.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN consent_information.information_provided IS
    'Information provided.';
COMMENT ON COLUMN consent_information.risks_explained IS
    'Risks explained.';
COMMENT ON COLUMN consent_information.benefits_explained IS
    'Benefits explained.';
COMMENT ON COLUMN consent_information.questions_answered IS
    'Questions answered.';
COMMENT ON COLUMN consent_information.consent_given IS
    'Consent given. One of: yes, no.';
COMMENT ON COLUMN consent_information.consent_date IS
    'Consent date.';
COMMENT ON COLUMN consent_information.guardian_consent IS
    'Guardian consent. One of: yes, no, notApplicable.';
COMMENT ON COLUMN consent_information.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN consent_information.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN consent_information.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN consent_information.deleted_at IS
    'Timestamp when this row was deleted.';
