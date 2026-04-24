CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    height_cm NUMERIC(5, 1)
        CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300)),
    weight_kg NUMERIC(5, 1)
        CHECK (weight_kg IS NULL OR (weight_kg >= 10 AND weight_kg <= 500)),
    bmi NUMERIC(5, 1)
        CHECK (bmi IS NULL OR (bmi >= 5 AND bmi <= 100)),
    waist_circumference_cm NUMERIC(5, 1)
        CHECK (waist_circumference_cm IS NULL OR (waist_circumference_cm >= 20 AND waist_circumference_cm <= 300))
);

CREATE TRIGGER trigger_body_measurements_updated_at
    BEFORE UPDATE ON body_measurements
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE body_measurements IS
    'Body measurements for cardiovascular risk assessment.';
COMMENT ON COLUMN body_measurements.height_cm IS
    'Patient height in centimetres.';
COMMENT ON COLUMN body_measurements.weight_kg IS
    'Patient weight in kilograms.';
COMMENT ON COLUMN body_measurements.bmi IS
    'Body mass index (can be overridden or calculated from height/weight).';
COMMENT ON COLUMN body_measurements.waist_circumference_cm IS
    'Waist circumference in centimetres.';

COMMENT ON COLUMN body_measurements.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN body_measurements.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN body_measurements.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN body_measurements.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN body_measurements.deleted_at IS
    'Timestamp when this row was deleted.';
