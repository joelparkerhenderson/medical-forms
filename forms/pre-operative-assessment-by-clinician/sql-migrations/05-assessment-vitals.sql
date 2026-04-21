-- 05-assessment-vitals.sql
-- Step 3: vital signs and anthropometric measurements.

CREATE TABLE assessment_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    spo2_percent NUMERIC(4,1),
    temperature_celsius NUMERIC(4,1),
    capillary_refill_seconds NUMERIC(3,1),
    pain_score_0_10 INTEGER
        CHECK (pain_score_0_10 IS NULL OR pain_score_0_10 BETWEEN 0 AND 10),
    on_room_air VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_room_air IN ('yes', 'no', '')),
    supplemental_oxygen_litres NUMERIC(3,1),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_vitals_updated_at
    BEFORE UPDATE ON assessment_vitals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_vitals IS
    'Step 3: clinician-measured vital signs at the time of pre-operative assessment.';
COMMENT ON COLUMN assessment_vitals.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_vitals.systolic_bp IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_vitals.diastolic_bp IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_vitals.heart_rate IS
    'Heart rate in beats per minute.';
COMMENT ON COLUMN assessment_vitals.respiratory_rate IS
    'Respiratory rate in breaths per minute.';
COMMENT ON COLUMN assessment_vitals.spo2_percent IS
    'Peripheral oxygen saturation as a percentage.';
COMMENT ON COLUMN assessment_vitals.temperature_celsius IS
    'Body temperature in degrees Celsius.';
COMMENT ON COLUMN assessment_vitals.capillary_refill_seconds IS
    'Capillary refill time in seconds.';
COMMENT ON COLUMN assessment_vitals.pain_score_0_10 IS
    'Self-reported pain score, 0 (none) to 10 (worst imaginable).';
COMMENT ON COLUMN assessment_vitals.on_room_air IS
    'Whether SpO2 was recorded on room air (yes/no/empty).';
COMMENT ON COLUMN assessment_vitals.supplemental_oxygen_litres IS
    'If on oxygen, flow rate in litres per minute.';
