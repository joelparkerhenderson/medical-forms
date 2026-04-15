--liquibase formatted sql

--changeset author:1
CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    nhs_number VARCHAR(20) UNIQUE,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient demographic information for prescription requests.';
COMMENT ON COLUMN patient.id IS 'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.first_name IS 'Patient given name.';
COMMENT ON COLUMN patient.last_name IS 'Patient family name.';
COMMENT ON COLUMN patient.date_of_birth IS 'Patient date of birth.';
COMMENT ON COLUMN patient.nhs_number IS 'NHS number, unique per patient.';
COMMENT ON COLUMN patient.phone IS 'Patient phone number.';
COMMENT ON COLUMN patient.email IS 'Patient email address.';
--rollback DROP TABLE patient;
