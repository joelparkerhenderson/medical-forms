-- 12_assessment_consent_eligibility.sql
-- Consent and eligibility decision section of the bone marrow donation assessment.

CREATE TABLE assessment_consent_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    informed_consent_given VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (informed_consent_given IN ('yes', 'no', '')),
    consent_form_signed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_form_signed IN ('yes', 'no', '')),
    consent_date DATE,
    witness_name VARCHAR(255) NOT NULL DEFAULT '',
    witness_role VARCHAR(255) NOT NULL DEFAULT '',
    information_leaflet_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (information_leaflet_provided IN ('yes', 'no', '')),
    questions_answered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (questions_answered IN ('yes', 'no', '')),
    eligibility_decision VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (eligibility_decision IN ('suitable', 'conditionally-suitable', 'unsuitable', '')),
    eligibility_conditions TEXT NOT NULL DEFAULT '',
    deferral_reason TEXT NOT NULL DEFAULT '',
    deferral_duration VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (deferral_duration IN ('temporary', 'permanent', '')),
    assessor_name VARCHAR(255) NOT NULL DEFAULT '',
    assessor_role VARCHAR(255) NOT NULL DEFAULT '',
    assessment_date DATE,
    consent_eligibility_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_consent_eligibility_updated_at
    BEFORE UPDATE ON assessment_consent_eligibility
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_consent_eligibility IS
    'Consent and eligibility decision section: consent status, eligibility outcome, deferral details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_consent_eligibility.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_consent_eligibility.informed_consent_given IS
    'Whether informed consent has been given: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_eligibility.consent_form_signed IS
    'Whether the consent form has been signed: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_eligibility.consent_date IS
    'Date consent was given.';
COMMENT ON COLUMN assessment_consent_eligibility.witness_name IS
    'Name of the consent witness.';
COMMENT ON COLUMN assessment_consent_eligibility.witness_role IS
    'Role of the consent witness.';
COMMENT ON COLUMN assessment_consent_eligibility.information_leaflet_provided IS
    'Whether information leaflet was provided: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_eligibility.questions_answered IS
    'Whether all donor questions were answered: yes, no, or empty.';
COMMENT ON COLUMN assessment_consent_eligibility.eligibility_decision IS
    'Eligibility decision: suitable, conditionally-suitable, unsuitable, or empty.';
COMMENT ON COLUMN assessment_consent_eligibility.eligibility_conditions IS
    'Conditions for conditional suitability if applicable.';
COMMENT ON COLUMN assessment_consent_eligibility.deferral_reason IS
    'Reason for deferral if unsuitable.';
COMMENT ON COLUMN assessment_consent_eligibility.deferral_duration IS
    'Duration of deferral: temporary, permanent, or empty.';
COMMENT ON COLUMN assessment_consent_eligibility.assessor_name IS
    'Name of the assessing clinician.';
COMMENT ON COLUMN assessment_consent_eligibility.assessor_role IS
    'Role of the assessing clinician.';
COMMENT ON COLUMN assessment_consent_eligibility.assessment_date IS
    'Date of the eligibility assessment.';
COMMENT ON COLUMN assessment_consent_eligibility.consent_eligibility_notes IS
    'Additional clinician notes on consent and eligibility.';
