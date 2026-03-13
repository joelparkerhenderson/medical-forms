-- 01_patient.sql
-- Patient demographic and GP registration information.

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(255) NOT NULL DEFAULT '',
    date_of_birth DATE,
    nhs_number VARCHAR(20) UNIQUE,
    address TEXT NOT NULL DEFAULT '',
    postcode VARCHAR(20) NOT NULL DEFAULT '',
    telephone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient demographic information including NHS registration and GP details.';
COMMENT ON COLUMN patient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.full_name IS
    'Patient full name.';
COMMENT ON COLUMN patient.date_of_birth IS
    'Patient date of birth.';
COMMENT ON COLUMN patient.nhs_number IS
    'NHS number, unique per patient.';
COMMENT ON COLUMN patient.gp_name IS
    'Name of the patient registered general practitioner.';
COMMENT ON COLUMN patient.gp_practice IS
    'Name of the GP practice where the patient is registered.';
