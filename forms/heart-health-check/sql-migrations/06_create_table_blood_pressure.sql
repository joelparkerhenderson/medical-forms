CREATE TABLE blood_pressure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    systolic_bp SMALLINT
        CHECK (systolic_bp IS NULL OR (systolic_bp >= 50 AND systolic_bp <= 300)),
    systolic_bp_sd NUMERIC(5, 2),
    diastolic_bp SMALLINT
        CHECK (diastolic_bp IS NULL OR (diastolic_bp >= 30 AND diastolic_bp <= 200)),
    on_bp_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_bp_treatment IN ('yes', 'no', '')),
    number_of_bp_medications SMALLINT
        CHECK (number_of_bp_medications IS NULL OR (number_of_bp_medications >= 0 AND number_of_bp_medications <= 20))
);

CREATE TRIGGER trigger_blood_pressure_updated_at
    BEFORE UPDATE ON blood_pressure
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE blood_pressure IS
    'Blood pressure readings and antihypertensive treatment status.';
COMMENT ON COLUMN blood_pressure.systolic_bp IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN blood_pressure.systolic_bp_sd IS
    'Standard deviation of systolic BP readings.';
COMMENT ON COLUMN blood_pressure.diastolic_bp IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN blood_pressure.on_bp_treatment IS
    'Whether the patient is on blood pressure treatment.';
COMMENT ON COLUMN blood_pressure.number_of_bp_medications IS
    'Number of concurrent BP medications.';

COMMENT ON COLUMN blood_pressure.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN blood_pressure.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN blood_pressure.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN blood_pressure.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN blood_pressure.deleted_at IS
    'Timestamp when this row was deleted.';
