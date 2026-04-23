-- Patient demographic information recorded by the clinician.

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    united_kingdom_nhs_number VARCHAR(20) UNIQUE
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient';
COMMENT ON COLUMN patient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.created_at IS
    'Timestamp when the record was created.';
COMMENT ON COLUMN patient.updated_at IS
    'Timestamp when the record was updated most-recently.';
COMMENT ON COLUMN patient.name IS
    'Patient name.';
COMMENT ON COLUMN patient.birth IS
    'Patient birth date.';
COMMENT ON COLUMN patient.united_kingdom_nhs_number IS
    'Patient United Kingdom NHS number, unique per patient.';

COMMENT ON COLUMN patient.birth_date IS
    'Birth date.';
