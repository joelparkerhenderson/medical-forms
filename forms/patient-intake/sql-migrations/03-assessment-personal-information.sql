-- 03_assessment_personal_information.sql
-- Personal information section of the patient intake assessment.

CREATE TABLE assessment_personal_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    first_name VARCHAR(255) NOT NULL DEFAULT '',
    middle_name VARCHAR(255) NOT NULL DEFAULT '',
    last_name VARCHAR(255) NOT NULL DEFAULT '',
    preferred_name VARCHAR(255) NOT NULL DEFAULT '',
    date_of_birth DATE,
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', 'other', '')),
    gender_identity VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (gender_identity IN ('man', 'woman', 'non-binary', 'prefer-not-to-say', 'other', '')),
    pronouns VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pronouns IN ('he-him', 'she-her', 'they-them', 'other', '')),
    marital_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (marital_status IN ('single', 'married', 'civil-partnership', 'divorced', 'widowed', 'separated', '')),
    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    preferred_language VARCHAR(100) NOT NULL DEFAULT '',
    interpreter_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interpreter_needed IN ('yes', 'no', '')),
    phone_home VARCHAR(50) NOT NULL DEFAULT '',
    phone_mobile VARCHAR(50) NOT NULL DEFAULT '',
    phone_work VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    address_line_1 VARCHAR(255) NOT NULL DEFAULT '',
    address_line_2 VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(100) NOT NULL DEFAULT '',
    county VARCHAR(100) NOT NULL DEFAULT '',
    postcode VARCHAR(20) NOT NULL DEFAULT '',
    emergency_contact_name VARCHAR(255) NOT NULL DEFAULT '',
    emergency_contact_phone VARCHAR(50) NOT NULL DEFAULT '',
    emergency_contact_relationship VARCHAR(100) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_personal_information_updated_at
    BEFORE UPDATE ON assessment_personal_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_personal_information IS
    'Personal information section: full demographics, contact details, and emergency contact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_personal_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_personal_information.first_name IS
    'Patient given name.';
COMMENT ON COLUMN assessment_personal_information.middle_name IS
    'Patient middle name(s).';
COMMENT ON COLUMN assessment_personal_information.last_name IS
    'Patient family name.';
COMMENT ON COLUMN assessment_personal_information.preferred_name IS
    'Name the patient prefers to be called.';
COMMENT ON COLUMN assessment_personal_information.date_of_birth IS
    'Patient date of birth.';
COMMENT ON COLUMN assessment_personal_information.sex IS
    'Patient sex: male, female, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_personal_information.gender_identity IS
    'Gender identity: man, woman, non-binary, prefer-not-to-say, other, or empty.';
COMMENT ON COLUMN assessment_personal_information.pronouns IS
    'Preferred pronouns: he-him, she-her, they-them, other, or empty.';
COMMENT ON COLUMN assessment_personal_information.marital_status IS
    'Marital status: single, married, civil-partnership, divorced, widowed, separated, or empty.';
COMMENT ON COLUMN assessment_personal_information.ethnicity IS
    'Self-reported ethnicity.';
COMMENT ON COLUMN assessment_personal_information.preferred_language IS
    'Preferred language for communication.';
COMMENT ON COLUMN assessment_personal_information.interpreter_needed IS
    'Whether an interpreter is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_personal_information.phone_home IS
    'Home telephone number.';
COMMENT ON COLUMN assessment_personal_information.phone_mobile IS
    'Mobile telephone number.';
COMMENT ON COLUMN assessment_personal_information.phone_work IS
    'Work telephone number.';
COMMENT ON COLUMN assessment_personal_information.email IS
    'Contact email address.';
COMMENT ON COLUMN assessment_personal_information.address_line_1 IS
    'First line of the postal address.';
COMMENT ON COLUMN assessment_personal_information.address_line_2 IS
    'Second line of the postal address.';
COMMENT ON COLUMN assessment_personal_information.city IS
    'City or town.';
COMMENT ON COLUMN assessment_personal_information.county IS
    'County or region.';
COMMENT ON COLUMN assessment_personal_information.postcode IS
    'Postal code.';
COMMENT ON COLUMN assessment_personal_information.emergency_contact_name IS
    'Name of the emergency contact.';
COMMENT ON COLUMN assessment_personal_information.emergency_contact_phone IS
    'Telephone number of the emergency contact.';
COMMENT ON COLUMN assessment_personal_information.emergency_contact_relationship IS
    'Relationship of the emergency contact to the patient.';
