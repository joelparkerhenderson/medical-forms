CREATE TABLE patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    name VARCHAR(255) NOT NULL DEFAULT '',
    birth_date DATE,
    united_kingdom_nhs_number VARCHAR(20) UNIQUE,
    waist_as_cm NUMERIC(5,1),
    height_as_cm NUMERIC(5,1),
    weight_as_kg NUMERIC(5,1),
    body_mass_index NUMERIC(4,1),
    waist_height_ratio NUMERIC(4,1),
    vo2_max NUMERIC(4,1)
);

CREATE TRIGGER trg_patient_updated_at
    BEFORE UPDATE ON patient
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient IS
    'Patient demographic information.';
COMMENT ON COLUMN patient.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN patient.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN patient.deleted_at IS
    'Soft-delete timestamp; NULL when the row is live.';
COMMENT ON COLUMN patient.name IS
    'Patient name.';
COMMENT ON COLUMN patient.birth_date IS
    'Patient date of birth.';
COMMENT ON COLUMN patient.united_kingdom_nhs_number IS
    'Patient UK NHS number, unique per patient.';
COMMENT ON COLUMN patient.waist_as_cm IS
    'Patient waist circumference in cm (for waist-height ratio).';
COMMENT ON COLUMN patient.height_as_cm IS
    'Patient height in cm.';
COMMENT ON COLUMN patient.weight_as_kg IS
    'Patient weight in kg.';
COMMENT ON COLUMN patient.body_mass_index IS
    'Patient body mass index (BMI), kg/m^2.';
COMMENT ON COLUMN patient.waist_height_ratio IS
    'Patient waist-to-height ratio (WHR).';
COMMENT ON COLUMN patient.vo2_max IS
    'Patient VO2 max (cardiorespiratory fitness proxy).';
