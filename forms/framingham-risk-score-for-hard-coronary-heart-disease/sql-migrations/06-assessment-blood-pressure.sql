-- 06_assessment_blood_pressure.sql
-- Step 4: Blood pressure section of the Framingham Risk Score assessment.

CREATE TABLE assessment_blood_pressure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    systolic_bp INTEGER
        CHECK (systolic_bp IS NULL OR (systolic_bp >= 50 AND systolic_bp <= 300)),
    diastolic_bp INTEGER
        CHECK (diastolic_bp IS NULL OR (diastolic_bp >= 20 AND diastolic_bp <= 200)),
    on_bp_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_bp_treatment IN ('yes', 'no', '')),
    bp_medication_name VARCHAR(255) NOT NULL DEFAULT '',
    bp_measurement_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (bp_measurement_method IN ('manual', 'automated', 'home', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_blood_pressure_updated_at
    BEFORE UPDATE ON assessment_blood_pressure
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_blood_pressure IS
    'Step 4 Blood Pressure: systolic and diastolic BP readings and treatment status. Treated vs untreated BP uses different Framingham coefficients. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_blood_pressure.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_blood_pressure.systolic_bp IS
    'Systolic blood pressure in mmHg (key Framingham variable).';
COMMENT ON COLUMN assessment_blood_pressure.diastolic_bp IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_blood_pressure.on_bp_treatment IS
    'Whether the patient is on antihypertensive treatment (affects Framingham coefficient).';
COMMENT ON COLUMN assessment_blood_pressure.bp_medication_name IS
    'Name of blood pressure medication if on treatment.';
COMMENT ON COLUMN assessment_blood_pressure.bp_measurement_method IS
    'Method used to measure blood pressure.';
