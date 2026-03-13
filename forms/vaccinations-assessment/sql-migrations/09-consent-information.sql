-- 09_consent_information.sql
-- Consent and information provision section (Step 8).
-- Likert items use 1-5 scale, NULL = unanswered.

CREATE TABLE consent_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
        CHECK (guardian_consent IN ('yes', 'no', 'notApplicable', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_consent_information_updated_at
    BEFORE UPDATE ON consent_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE consent_information IS
    'Consent quality scoring (1-5 Likert) and consent status. One-to-one child of assessment.';
