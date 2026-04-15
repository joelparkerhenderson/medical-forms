-- 01_patient.sql
-- Patient demographic information.

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    nhs_number VARCHAR(20) UNIQUE,
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', 'other', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient demographic information including NHS registration.';
COMMENT ON COLUMN patient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.first_name IS
    'Patient given name.';
COMMENT ON COLUMN patient.last_name IS
    'Patient family name.';
COMMENT ON COLUMN patient.date_of_birth IS
    'Patient date of birth.';
COMMENT ON COLUMN patient.nhs_number IS
    'NHS number, unique per patient.';
COMMENT ON COLUMN patient.sex IS
    'Patient sex: male, female, other, or empty string if unanswered.';
