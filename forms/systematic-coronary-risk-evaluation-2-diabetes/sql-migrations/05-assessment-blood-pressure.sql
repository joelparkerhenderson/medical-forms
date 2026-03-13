-- 05_assessment_blood_pressure.sql
-- Blood pressure section of the assessment.

CREATE TABLE assessment_blood_pressure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    systolic_bp INTEGER
        CHECK (systolic_bp IS NULL OR (systolic_bp >= 60 AND systolic_bp <= 300)),
    diastolic_bp INTEGER
        CHECK (diastolic_bp IS NULL OR (diastolic_bp >= 30 AND diastolic_bp <= 200)),
    on_antihypertensive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antihypertensive IN ('yes', 'no', '')),
    number_of_bp_medications INTEGER
        CHECK (number_of_bp_medications IS NULL OR (number_of_bp_medications >= 0 AND number_of_bp_medications <= 10)),
    bp_at_target VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bp_at_target IN ('yes', 'no', '')),
    home_bp_monitoring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (home_bp_monitoring IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_blood_pressure_updated_at
    BEFORE UPDATE ON assessment_blood_pressure
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_blood_pressure IS
    'Blood pressure section: readings and antihypertensive treatment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_blood_pressure.systolic_bp IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_blood_pressure.diastolic_bp IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_blood_pressure.on_antihypertensive IS
    'Whether patient is on antihypertensive medication.';
COMMENT ON COLUMN assessment_blood_pressure.bp_at_target IS
    'Whether blood pressure is at target despite treatment.';
