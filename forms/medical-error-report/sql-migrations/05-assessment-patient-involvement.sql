-- 05_assessment_patient_involvement.sql
-- Patient involvement section of the medical error report.

CREATE TABLE assessment_patient_involvement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    patient_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_involved IN ('yes', 'no', '')),
    patient_first_name VARCHAR(255) NOT NULL DEFAULT '',
    patient_last_name VARCHAR(255) NOT NULL DEFAULT '',
    patient_nhs_number VARCHAR(20) NOT NULL DEFAULT '',
    patient_date_of_birth DATE,
    patient_sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (patient_sex IN ('male', 'female', 'other', '')),
    patient_age_at_incident INTEGER,
    patient_informed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_informed IN ('yes', 'no', '')),
    patient_informed_date DATE,
    patient_informed_by VARCHAR(255) NOT NULL DEFAULT '',
    duty_of_candour_applies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (duty_of_candour_applies IN ('yes', 'no', '')),
    duty_of_candour_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (duty_of_candour_completed IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_patient_involvement_updated_at
    BEFORE UPDATE ON assessment_patient_involvement
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_patient_involvement IS
    'Patient involvement section: patient details, notification, duty of candour. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_patient_involvement.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_patient_involvement.patient_involved IS
    'Whether a patient was involved in the error: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_involvement.patient_first_name IS
    'First name of the affected patient.';
COMMENT ON COLUMN assessment_patient_involvement.patient_last_name IS
    'Last name of the affected patient.';
COMMENT ON COLUMN assessment_patient_involvement.patient_nhs_number IS
    'NHS number of the affected patient.';
COMMENT ON COLUMN assessment_patient_involvement.patient_date_of_birth IS
    'Date of birth of the affected patient.';
COMMENT ON COLUMN assessment_patient_involvement.patient_sex IS
    'Sex of the affected patient: male, female, other, or empty.';
COMMENT ON COLUMN assessment_patient_involvement.patient_age_at_incident IS
    'Age of the patient at the time of the incident.';
COMMENT ON COLUMN assessment_patient_involvement.patient_informed IS
    'Whether the patient has been informed of the error: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_involvement.patient_informed_date IS
    'Date the patient was informed.';
COMMENT ON COLUMN assessment_patient_involvement.patient_informed_by IS
    'Name and role of person who informed the patient.';
COMMENT ON COLUMN assessment_patient_involvement.duty_of_candour_applies IS
    'Whether statutory duty of candour applies: yes, no, or empty.';
COMMENT ON COLUMN assessment_patient_involvement.duty_of_candour_completed IS
    'Whether duty of candour notification is complete: yes, no, or empty.';
