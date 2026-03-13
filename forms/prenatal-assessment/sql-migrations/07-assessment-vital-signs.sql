-- 07_assessment_vital_signs.sql
-- Vital signs section of the prenatal assessment.

CREATE TABLE assessment_vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    systolic_bp_mmhg INTEGER
        CHECK (systolic_bp_mmhg IS NULL OR (systolic_bp_mmhg >= 50 AND systolic_bp_mmhg <= 300)),
    diastolic_bp_mmhg INTEGER
        CHECK (diastolic_bp_mmhg IS NULL OR (diastolic_bp_mmhg >= 20 AND diastolic_bp_mmhg <= 200)),
    heart_rate_bpm INTEGER
        CHECK (heart_rate_bpm IS NULL OR (heart_rate_bpm >= 30 AND heart_rate_bpm <= 250)),
    temperature_celsius NUMERIC(4,1)
        CHECK (temperature_celsius IS NULL OR (temperature_celsius >= 34.0 AND temperature_celsius <= 42.0)),
    respiratory_rate INTEGER
        CHECK (respiratory_rate IS NULL OR (respiratory_rate >= 5 AND respiratory_rate <= 60)),
    oxygen_saturation_pct NUMERIC(4,1)
        CHECK (oxygen_saturation_pct IS NULL OR (oxygen_saturation_pct >= 50.0 AND oxygen_saturation_pct <= 100.0)),
    weight_kg NUMERIC(5,1)
        CHECK (weight_kg IS NULL OR weight_kg > 0),
    pre_pregnancy_weight_kg NUMERIC(5,1)
        CHECK (pre_pregnancy_weight_kg IS NULL OR pre_pregnancy_weight_kg > 0),
    weight_gain_kg NUMERIC(5,1),
    fundal_height_cm NUMERIC(4,1)
        CHECK (fundal_height_cm IS NULL OR fundal_height_cm > 0),
    fetal_heart_rate_bpm INTEGER
        CHECK (fetal_heart_rate_bpm IS NULL OR (fetal_heart_rate_bpm >= 60 AND fetal_heart_rate_bpm <= 220)),
    fetal_lie VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fetal_lie IN ('longitudinal', 'oblique', 'transverse', '')),
    fetal_presentation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fetal_presentation IN ('cephalic', 'breech', 'transverse', 'unstable', '')),
    proteinuria VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (proteinuria IN ('none', 'trace', '1+', '2+', '3+', '4+', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_vital_signs_updated_at
    BEFORE UPDATE ON assessment_vital_signs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_vital_signs IS
    'Vital signs section: maternal and fetal observations including blood pressure, fundal height, and fetal heart rate. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_vital_signs.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_vital_signs.systolic_bp_mmhg IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_vital_signs.diastolic_bp_mmhg IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_vital_signs.heart_rate_bpm IS
    'Maternal heart rate in beats per minute.';
COMMENT ON COLUMN assessment_vital_signs.temperature_celsius IS
    'Body temperature in degrees Celsius.';
COMMENT ON COLUMN assessment_vital_signs.respiratory_rate IS
    'Respiratory rate in breaths per minute.';
COMMENT ON COLUMN assessment_vital_signs.oxygen_saturation_pct IS
    'Oxygen saturation percentage (SpO2).';
COMMENT ON COLUMN assessment_vital_signs.weight_kg IS
    'Current weight in kilograms.';
COMMENT ON COLUMN assessment_vital_signs.pre_pregnancy_weight_kg IS
    'Pre-pregnancy weight in kilograms.';
COMMENT ON COLUMN assessment_vital_signs.weight_gain_kg IS
    'Weight gain since beginning of pregnancy.';
COMMENT ON COLUMN assessment_vital_signs.fundal_height_cm IS
    'Symphysis-fundal height in centimetres.';
COMMENT ON COLUMN assessment_vital_signs.fetal_heart_rate_bpm IS
    'Fetal heart rate in beats per minute.';
COMMENT ON COLUMN assessment_vital_signs.fetal_lie IS
    'Fetal lie: longitudinal, oblique, transverse, or empty.';
COMMENT ON COLUMN assessment_vital_signs.fetal_presentation IS
    'Fetal presentation: cephalic, breech, transverse, unstable, or empty.';
COMMENT ON COLUMN assessment_vital_signs.proteinuria IS
    'Urine protein dipstick result: none, trace, 1+ through 4+, or empty.';
