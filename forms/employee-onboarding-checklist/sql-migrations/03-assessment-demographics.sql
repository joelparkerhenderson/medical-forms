-- 03_assessment_demographics.sql
-- Demographics section of the onboarding assessment.

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
    emergency_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_phone VARCHAR(30) NOT NULL DEFAULT '',
    emergency_contact_relationship VARCHAR(100) NOT NULL DEFAULT '',
    address_line_1 VARCHAR(255) NOT NULL DEFAULT '',
    address_line_2 VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '',
    postcode VARCHAR(20) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: identity, language, emergency contact, and address details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.preferred_name IS
    'Name the employee prefers to be called.';
COMMENT ON COLUMN assessment_demographics.gender_identity IS
    'Employee gender identity: male, female, non-binary, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Employee ethnic background.';
COMMENT ON COLUMN assessment_demographics.preferred_language IS
    'Primary language spoken by the employee.';
COMMENT ON COLUMN assessment_demographics.interpreter_required IS
    'Whether an interpreter is needed: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_name IS
    'Name of the emergency contact.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_phone IS
    'Phone number of the emergency contact.';
COMMENT ON COLUMN assessment_demographics.emergency_contact_relationship IS
    'Relationship of the emergency contact to the employee.';
COMMENT ON COLUMN assessment_demographics.address_line_1 IS
    'First line of the employee home address.';
COMMENT ON COLUMN assessment_demographics.address_line_2 IS
    'Second line of the employee home address.';
COMMENT ON COLUMN assessment_demographics.city IS
    'City or town of the employee home address.';
COMMENT ON COLUMN assessment_demographics.postcode IS
    'Postcode of the employee home address.';
