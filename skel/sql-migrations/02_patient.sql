-- Patient demographic information recorded by the clinician.

CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    united_kingdom_nhs_number VARCHAR(20) UNIQUE
    waist_as_cm NUMERIC(5,1),
    height_as_cm NUMERIC(5,1),
    weight_as_kg NUMERIC(5,1),
    body_mass_index NUMERIC(4,1),
    waist_height_ratio NUMERIC(4,1),
    vo2_max  NUMERIC(4,1)
);

CREATE TRIGGER trigger_patient_updated_at
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
COMMENT ON COLUMN patient.updated_at IS
    'Timestamp when the record was deleted a.k.a. soft-deleted.';
COMMENT ON COLUMN patient.name IS
    'Patient name.';
COMMENT ON COLUMN patient.birth IS
    'Patient birth date.';
COMMENT ON COLUMN patient.united_kingdom_nhs_number IS
    'Patient United Kingdom NHS number, unique per patient.';
COMMENT ON COLUMN patient.united_kingdom_nhs_number IS
    'Patient United Kingdom NHS number, unique per patient.';
COMMENT ON COLUMN patient.waist_as_cm IS
    'Patient waist circumference measurement in cm, such as for calculating waist-height ratio (WHR).';
COMMENT ON COLUMN patient.height_as_cm IS
    'Patient height measurement in cm, such as for calculating waist-height ratio (WHR).';
COMMENT ON COLUMN patient.body_mass_index IS
    'Patient body mass index (BMI) measurement.';
COMMENT ON COLUMN patient.waist_height_ratio IS
    'Patient waist-height ratio (WHR) measurement.';
COMMENT ON COLUMN patient.vo2_max IS
    'Patient VO2 max measurement.';

CREATE INDEX patient_index_gto
    ON patient
    USING GIN ((
        name
    ) gin_trgm_ops);
