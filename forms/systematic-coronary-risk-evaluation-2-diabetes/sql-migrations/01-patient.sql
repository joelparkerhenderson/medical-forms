-- 01_patient.sql
-- Patient demographic information.

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', '')),
    nhs_number VARCHAR(20) UNIQUE,
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    ethnicity VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (ethnicity IN ('white', 'asian', 'black', 'mixed', 'other', '')),

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
COMMENT ON COLUMN patient.full_name IS
    'Patient full name.';
COMMENT ON COLUMN patient.date_of_birth IS
    'Patient date of birth.';
COMMENT ON COLUMN patient.sex IS
    'Patient sex: male, female, or empty string if unanswered.';
COMMENT ON COLUMN patient.nhs_number IS
    'NHS number, unique per patient.';
COMMENT ON COLUMN patient.height_cm IS
    'Patient height in centimetres.';
COMMENT ON COLUMN patient.weight_kg IS
    'Patient weight in kilograms.';
COMMENT ON COLUMN patient.ethnicity IS
    'Patient ethnicity: white, asian, black, mixed, other, or empty string if unanswered.';
