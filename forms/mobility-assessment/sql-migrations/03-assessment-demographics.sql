-- 03_assessment_demographics.sql
-- Demographics section of the mobility assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    occupation VARCHAR(255) NOT NULL DEFAULT '',
    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    contact_email VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',
    living_environment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (living_environment IN ('house', 'flat', 'bungalow', 'care-home', 'sheltered', '')),
    stairs_at_home VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stairs_at_home IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: occupation, contact information, and home environment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Patient occupation or primary work role.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient self-reported ethnicity.';
COMMENT ON COLUMN assessment_demographics.contact_phone IS
    'Patient contact phone number.';
COMMENT ON COLUMN assessment_demographics.contact_email IS
    'Patient contact email address.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_name IS
    'Emergency contact person name.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_phone IS
    'Emergency contact phone number.';
COMMENT ON COLUMN assessment_demographics.gp_name IS
    'Name of the patient general practitioner.';
COMMENT ON COLUMN assessment_demographics.gp_practice IS
    'GP practice or surgery name.';
COMMENT ON COLUMN assessment_demographics.living_environment IS
    'Type of living environment: house, flat, bungalow, care-home, sheltered, or empty string.';
COMMENT ON COLUMN assessment_demographics.stairs_at_home IS
    'Whether the home has stairs: yes, no, or empty string.';
