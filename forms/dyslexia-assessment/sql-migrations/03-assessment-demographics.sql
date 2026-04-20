-- 03_assessment_demographics.sql
-- Demographics section of the dyslexia assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_name VARCHAR(255) NOT NULL DEFAULT '',
    gender_identity VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (gender_identity IN ('male', 'female', 'non-binary', 'other', '')),
    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    preferred_language VARCHAR(100) NOT NULL DEFAULT '',
    interpreter_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interpreter_required IN ('yes', 'no', '')),
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',
    referrer_name VARCHAR(255) NOT NULL DEFAULT '',
    referrer_role VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: identity, language, GP, and referrer details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.preferred_name IS
    'Name the patient prefers to be called.';
COMMENT ON COLUMN assessment_demographics.gender_identity IS
    'Patient gender identity: male, female, non-binary, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient ethnic background.';
COMMENT ON COLUMN assessment_demographics.preferred_language IS
    'Primary language spoken by the patient.';
COMMENT ON COLUMN assessment_demographics.interpreter_required IS
    'Whether an interpreter is needed: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.gp_name IS
    'Name of the patient registered general practitioner.';
COMMENT ON COLUMN assessment_demographics.gp_practice IS
    'Name of the GP practice.';
COMMENT ON COLUMN assessment_demographics.referrer_name IS
    'Name of the referring clinician.';
COMMENT ON COLUMN assessment_demographics.referrer_role IS
    'Role or title of the referring clinician.';
