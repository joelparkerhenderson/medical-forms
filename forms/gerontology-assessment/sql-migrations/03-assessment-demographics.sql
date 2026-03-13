-- 03_assessment_demographics.sql
-- Demographics section of the gerontology assessment.

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
        CHECK (living_situation IN ('alone', 'with-spouse', 'with-family', 'care-home', 'sheltered-housing', '')),
    next_of_kin_name VARCHAR(255) NOT NULL DEFAULT '',
    next_of_kin_phone VARCHAR(50) NOT NULL DEFAULT '',
    next_of_kin_relationship VARCHAR(100) NOT NULL DEFAULT '',
    has_lasting_power_of_attorney VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_lasting_power_of_attorney IN ('yes', 'no', '')),
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
    'Demographics section: ethnicity, living situation, next of kin, and GP details. One-to-one child of assessment.';
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
    'Current living arrangement: alone, with-spouse, with-family, care-home, sheltered-housing, or empty string.';
COMMENT ON COLUMN assessment_demographics.next_of_kin_name IS
    'Next of kin full name.';
COMMENT ON COLUMN assessment_demographics.next_of_kin_phone IS
    'Next of kin telephone number.';
COMMENT ON COLUMN assessment_demographics.next_of_kin_relationship IS
    'Relationship of next of kin to the patient.';
COMMENT ON COLUMN assessment_demographics.has_lasting_power_of_attorney IS
    'Whether a lasting power of attorney is in place: yes, no, or empty string.';
COMMENT ON COLUMN assessment_demographics.gp_name IS
    'Name of the registered general practitioner.';
COMMENT ON COLUMN assessment_demographics.gp_practice IS
    'Name of the GP practice.';
