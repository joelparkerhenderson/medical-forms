-- 03_assessment_personal_information.sql
-- Personal information section of the advance decision to refuse treatment.

CREATE TABLE assessment_personal_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    full_name VARCHAR(255) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    postcode VARCHAR(20) NOT NULL DEFAULT '',
    date_of_birth DATE,
    nhs_number VARCHAR(20) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',
    gp_address TEXT NOT NULL DEFAULT '',
    gp_phone VARCHAR(30) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_personal_information_updated_at
    BEFORE UPDATE ON assessment_personal_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_personal_information IS
    'Personal information section: patient identification and GP details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_personal_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_personal_information.full_name IS
    'Full legal name of the person making the advance decision.';
COMMENT ON COLUMN assessment_personal_information.address IS
    'Home address of the person making the advance decision.';
COMMENT ON COLUMN assessment_personal_information.postcode IS
    'Postal code of the home address.';
COMMENT ON COLUMN assessment_personal_information.date_of_birth IS
    'Date of birth, NULL if unanswered.';
COMMENT ON COLUMN assessment_personal_information.nhs_number IS
    'NHS number for patient identification.';
COMMENT ON COLUMN assessment_personal_information.gp_name IS
    'Name of the registered general practitioner.';
COMMENT ON COLUMN assessment_personal_information.gp_practice IS
    'Name of the GP practice.';
COMMENT ON COLUMN assessment_personal_information.gp_address IS
    'Address of the GP practice.';
COMMENT ON COLUMN assessment_personal_information.gp_phone IS
    'Phone number of the GP practice.';
