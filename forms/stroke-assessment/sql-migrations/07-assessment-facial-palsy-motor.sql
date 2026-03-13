-- 07_assessment_facial_palsy_motor.sql
-- Facial palsy and motor examination section of the stroke assessment (NIHSS items 4-6).

CREATE TABLE assessment_facial_palsy_motor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS 4: Facial palsy
    nihss_4_facial_palsy INTEGER
        CHECK (nihss_4_facial_palsy IS NULL OR (nihss_4_facial_palsy >= 0 AND nihss_4_facial_palsy <= 3)),

    -- NIHSS 5a: Motor arm - left
    nihss_5a_motor_arm_left INTEGER
        CHECK (nihss_5a_motor_arm_left IS NULL OR (nihss_5a_motor_arm_left >= 0 AND nihss_5a_motor_arm_left <= 4)),

    -- NIHSS 5b: Motor arm - right
    nihss_5b_motor_arm_right INTEGER
        CHECK (nihss_5b_motor_arm_right IS NULL OR (nihss_5b_motor_arm_right >= 0 AND nihss_5b_motor_arm_right <= 4)),

    -- NIHSS 6a: Motor leg - left
    nihss_6a_motor_leg_left INTEGER
        CHECK (nihss_6a_motor_leg_left IS NULL OR (nihss_6a_motor_leg_left >= 0 AND nihss_6a_motor_leg_left <= 4)),

    -- NIHSS 6b: Motor leg - right
    nihss_6b_motor_leg_right INTEGER
        CHECK (nihss_6b_motor_leg_right IS NULL OR (nihss_6b_motor_leg_right >= 0 AND nihss_6b_motor_leg_right <= 4)),

    facial_droop_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (facial_droop_side IN ('left', 'right', 'bilateral', 'none', '')),
    pronator_drift VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (pronator_drift IN ('left', 'right', 'bilateral', 'none', '')),
    motor_deficit_pattern VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (motor_deficit_pattern IN ('hemiparesis', 'hemiplegia', 'monoparesis', 'quadriparesis', 'none', '')),
    affected_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (affected_side IN ('left', 'right', 'bilateral', 'none', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_facial_palsy_motor_updated_at
    BEFORE UPDATE ON assessment_facial_palsy_motor
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_facial_palsy_motor IS
    'Facial palsy and motor section (NIHSS items 4-6): facial symmetry, arm and leg motor function. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_facial_palsy_motor.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_facial_palsy_motor.nihss_4_facial_palsy IS
    'NIHSS 4: 0=normal, 1=minor (flattened nasolabial fold, asymmetry on smiling), 2=partial (total or near-total lower face paralysis), 3=complete (one or both sides).';
COMMENT ON COLUMN assessment_facial_palsy_motor.nihss_5a_motor_arm_left IS
    'NIHSS 5a left arm: 0=no drift, 1=drift before 10s, 2=some effort against gravity, 3=no effort against gravity, 4=no movement.';
COMMENT ON COLUMN assessment_facial_palsy_motor.nihss_5b_motor_arm_right IS
    'NIHSS 5b right arm: same 0-4 scale as 5a.';
COMMENT ON COLUMN assessment_facial_palsy_motor.nihss_6a_motor_leg_left IS
    'NIHSS 6a left leg: 0=no drift, 1=drift before 5s, 2=some effort against gravity, 3=no effort against gravity, 4=no movement.';
COMMENT ON COLUMN assessment_facial_palsy_motor.nihss_6b_motor_leg_right IS
    'NIHSS 6b right leg: same 0-4 scale as 6a.';
COMMENT ON COLUMN assessment_facial_palsy_motor.facial_droop_side IS
    'Side of facial droop: left, right, bilateral, none, or empty string.';
COMMENT ON COLUMN assessment_facial_palsy_motor.pronator_drift IS
    'Side showing pronator drift: left, right, bilateral, none, or empty string.';
COMMENT ON COLUMN assessment_facial_palsy_motor.motor_deficit_pattern IS
    'Motor deficit pattern: hemiparesis, hemiplegia, monoparesis, quadriparesis, none, or empty string.';
COMMENT ON COLUMN assessment_facial_palsy_motor.affected_side IS
    'Predominantly affected side: left, right, bilateral, none, or empty string.';
