-- 03_assessment_demographics.sql
-- Demographics section of the hearing aid assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    primary_language VARCHAR(100) NOT NULL DEFAULT '',
    interpreter_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interpreter_required IN ('yes', 'no', '')),
    marital_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (marital_status IN ('single', 'married', 'partnered', 'divorced', 'widowed', '')),
    living_situation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (living_situation IN ('alone', 'with-spouse', 'with-family', 'care-home', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    retired VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (retired IN ('yes', 'no', '')),
    emergency_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    emergency_contact_relationship VARCHAR(100) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: ethnicity, language, living situation, and GP details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Self-reported ethnic background.';
COMMENT ON COLUMN assessment_demographics.primary_language IS
    'Primary spoken language.';
COMMENT ON COLUMN assessment_demographics.interpreter_required IS
    'Whether an interpreter is required: yes, no, or empty string.';
COMMENT ON COLUMN assessment_demographics.marital_status IS
    'Marital status: single, married, partnered, divorced, widowed, or empty string.';
COMMENT ON COLUMN assessment_demographics.living_situation IS
    'Current living arrangement: alone, with-spouse, with-family, care-home, or empty string.';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Current or former occupation.';
COMMENT ON COLUMN assessment_demographics.retired IS
    'Whether the patient is retired: yes, no, or empty string.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_name IS
    'Emergency contact full name.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_phone IS
    'Emergency contact telephone number.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_relationship IS
    'Relationship of emergency contact to the patient.';
COMMENT ON COLUMN assessment_demographics.gp_name IS
    'Name of the registered general practitioner.';
COMMENT ON COLUMN assessment_demographics.gp_practice IS
    'Name of the GP practice.';
