-- 03_assessment_patient_information.sql
-- Step 1: Patient information section of the Framingham Risk Score assessment.

CREATE TABLE assessment_patient_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    full_name VARCHAR(255) NOT NULL DEFAULT '',
    date_of_birth DATE,
    nhs_number VARCHAR(20) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    telephone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_patient_information_updated_at
    BEFORE UPDATE ON assessment_patient_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_patient_information IS
    'Step 1 Patient Information: identifying details for the Framingham assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_patient_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_patient_information.full_name IS
    'Patient full name.';
COMMENT ON COLUMN assessment_patient_information.date_of_birth IS
    'Patient date of birth, NULL if unanswered.';
COMMENT ON COLUMN assessment_patient_information.nhs_number IS
    'NHS number for patient identification.';
COMMENT ON COLUMN assessment_patient_information.address IS
    'Patient postal address.';
COMMENT ON COLUMN assessment_patient_information.telephone IS
    'Patient telephone number.';
COMMENT ON COLUMN assessment_patient_information.email IS
    'Patient email address.';
COMMENT ON COLUMN assessment_patient_information.gp_name IS
    'Name of the patient general practitioner.';
COMMENT ON COLUMN assessment_patient_information.gp_practice IS
    'Name of the GP practice.';
