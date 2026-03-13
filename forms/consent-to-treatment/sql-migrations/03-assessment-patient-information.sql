-- 03_assessment_patient_information.sql
-- Patient information section of the consent to treatment form.

CREATE TABLE assessment_patient_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_name VARCHAR(255) NOT NULL DEFAULT '',
    gender_identity VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (gender_identity IN ('male', 'female', 'non-binary', 'other', '')),
    address TEXT NOT NULL DEFAULT '',
    telephone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    nhs_number VARCHAR(20) NOT NULL DEFAULT '',
    hospital_number VARCHAR(30) NOT NULL DEFAULT '',
    ward_department VARCHAR(255) NOT NULL DEFAULT '',
    consultant_name VARCHAR(255) NOT NULL DEFAULT '',
    interpreter_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interpreter_required IN ('yes', 'no', '')),
    interpreter_language VARCHAR(100) NOT NULL DEFAULT '',
    next_of_kin_name VARCHAR(255) NOT NULL DEFAULT '',
    next_of_kin_relationship VARCHAR(50) NOT NULL DEFAULT '',
    next_of_kin_telephone VARCHAR(30) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_patient_information_updated_at
    BEFORE UPDATE ON assessment_patient_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_patient_information IS
    'Patient information section: contact details, hospital identifiers, consultant, and next of kin. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_patient_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_patient_information.preferred_name IS
    'Name the patient prefers to be called.';
COMMENT ON COLUMN assessment_patient_information.gender_identity IS
    'Patient gender identity: male, female, non-binary, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.address IS
    'Patient home address.';
COMMENT ON COLUMN assessment_patient_information.telephone IS
    'Patient telephone number.';
COMMENT ON COLUMN assessment_patient_information.email IS
    'Patient email address.';
COMMENT ON COLUMN assessment_patient_information.nhs_number IS
    'NHS number for patient identification.';
COMMENT ON COLUMN assessment_patient_information.hospital_number IS
    'Hospital or medical record number.';
COMMENT ON COLUMN assessment_patient_information.ward_department IS
    'Ward or department where the procedure will take place.';
COMMENT ON COLUMN assessment_patient_information.consultant_name IS
    'Name of the responsible consultant.';
COMMENT ON COLUMN assessment_patient_information.interpreter_required IS
    'Whether an interpreter is needed: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_information.interpreter_language IS
    'Language required for interpreter.';
COMMENT ON COLUMN assessment_patient_information.next_of_kin_name IS
    'Name of the next of kin.';
COMMENT ON COLUMN assessment_patient_information.next_of_kin_relationship IS
    'Relationship of next of kin to the patient.';
COMMENT ON COLUMN assessment_patient_information.next_of_kin_telephone IS
    'Telephone number of the next of kin.';
