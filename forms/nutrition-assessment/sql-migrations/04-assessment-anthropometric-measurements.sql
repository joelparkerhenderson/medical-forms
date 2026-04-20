-- 04_assessment_anthropometric_measurements.sql
-- Anthropometric measurements section of the nutrition assessment.

CREATE TABLE assessment_anthropometric_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    current_weight_kg NUMERIC(5,1)
        CHECK (current_weight_kg IS NULL OR current_weight_kg > 0),
    usual_weight_kg NUMERIC(5,1)
        CHECK (usual_weight_kg IS NULL OR usual_weight_kg > 0),
    height_cm NUMERIC(5,1)
        CHECK (height_cm IS NULL OR height_cm > 0),
    bmi NUMERIC(4,1)
        CHECK (bmi IS NULL OR bmi > 0),
    mid_upper_arm_circumference_cm NUMERIC(4,1)
        CHECK (mid_upper_arm_circumference_cm IS NULL OR mid_upper_arm_circumference_cm > 0),
    waist_circumference_cm NUMERIC(5,1)
        CHECK (waist_circumference_cm IS NULL OR waist_circumference_cm > 0),
    unplanned_weight_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unplanned_weight_loss IN ('yes', 'no', '')),
    weight_loss_percent NUMERIC(4,1)
        CHECK (weight_loss_percent IS NULL OR (weight_loss_percent >= 0 AND weight_loss_percent <= 100)),
    weight_loss_timeframe VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (weight_loss_timeframe IN ('1-month', '3-months', '6-months', 'over-6-months', '')),
    unable_to_weigh VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unable_to_weigh IN ('yes', 'no', '')),
    unable_to_weigh_reason TEXT NOT NULL DEFAULT '',
    anthropometric_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anthropometric_measurements_updated_at
    BEFORE UPDATE ON assessment_anthropometric_measurements
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anthropometric_measurements IS
    'Anthropometric measurements section: weight, height, BMI, arm circumference, and weight change history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_anthropometric_measurements.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_anthropometric_measurements.current_weight_kg IS
    'Current weight in kilograms.';
COMMENT ON COLUMN assessment_anthropometric_measurements.usual_weight_kg IS
    'Usual or pre-illness weight in kilograms.';
COMMENT ON COLUMN assessment_anthropometric_measurements.height_cm IS
    'Height in centimetres.';
COMMENT ON COLUMN assessment_anthropometric_measurements.bmi IS
    'Body mass index, auto-calculated from current weight and height.';
COMMENT ON COLUMN assessment_anthropometric_measurements.mid_upper_arm_circumference_cm IS
    'Mid-upper arm circumference (MUAC) in centimetres, used as BMI proxy if unable to weigh.';
COMMENT ON COLUMN assessment_anthropometric_measurements.waist_circumference_cm IS
    'Waist circumference in centimetres.';
COMMENT ON COLUMN assessment_anthropometric_measurements.unplanned_weight_loss IS
    'Whether there has been unplanned weight loss: yes, no, or empty.';
COMMENT ON COLUMN assessment_anthropometric_measurements.weight_loss_percent IS
    'Percentage of unplanned weight loss over the specified timeframe.';
COMMENT ON COLUMN assessment_anthropometric_measurements.weight_loss_timeframe IS
    'Timeframe over which weight loss occurred: 1-month, 3-months, 6-months, over-6-months, or empty.';
COMMENT ON COLUMN assessment_anthropometric_measurements.unable_to_weigh IS
    'Whether the patient cannot be weighed: yes, no, or empty.';
COMMENT ON COLUMN assessment_anthropometric_measurements.unable_to_weigh_reason IS
    'Reason the patient cannot be weighed.';
COMMENT ON COLUMN assessment_anthropometric_measurements.anthropometric_notes IS
    'Additional clinician notes on anthropometric measurements.';
