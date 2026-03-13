-- 03_assessment_demographics.sql
-- Demographics section of the neurology assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    occupation VARCHAR(255) NOT NULL DEFAULT '',
    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    handedness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (handedness IN ('left', 'right', 'ambidextrous', '')),
    contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    contact_email VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_phone VARCHAR(50) NOT NULL DEFAULT '',
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
    'Demographics section: occupation, handedness, and contact information. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Patient occupation or primary work role.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient self-reported ethnicity.';
COMMENT ON COLUMN assessment_demographics.handedness IS
    'Patient handedness: left, right, ambidextrous, or empty string. Important for stroke lateralisation.';
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
