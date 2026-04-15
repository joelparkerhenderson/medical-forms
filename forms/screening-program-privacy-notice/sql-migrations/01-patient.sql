-- liquibase formatted sql

-- changeset screening-program-privacy-notice:01-patient

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    nhs_number TEXT NOT NULL DEFAULT '' UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS 'Patient demographic information.';
COMMENT ON COLUMN patient.id IS 'Unique identifier for the patient (UUID).';
COMMENT ON COLUMN patient.first_name IS 'Patient first name.';
COMMENT ON COLUMN patient.last_name IS 'Patient last name.';
COMMENT ON COLUMN patient.nhs_number IS 'NHS number, unique identifier within the NHS.';
COMMENT ON COLUMN patient.created_at IS 'Timestamp when the record was created.';
COMMENT ON COLUMN patient.updated_at IS 'Timestamp when the record was last updated.';
