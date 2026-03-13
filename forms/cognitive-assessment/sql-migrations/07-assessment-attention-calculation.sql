-- 07_assessment_attention_calculation.sql
-- Attention and calculation section of the cognitive assessment (MMSE items 14-18).

CREATE TABLE assessment_attention_calculation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Serial 7s or WORLD backwards (5 points)
    test_used VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (test_used IN ('serial-7s', 'world-backwards', '')),

    -- Serial 7s: 100-7=93, 93-7=86, 86-7=79, 79-7=72, 72-7=65
    serial_7s_attempt_1 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (serial_7s_attempt_1 IN ('correct', 'incorrect', '')),
    serial_7s_attempt_2 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (serial_7s_attempt_2 IN ('correct', 'incorrect', '')),
    serial_7s_attempt_3 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (serial_7s_attempt_3 IN ('correct', 'incorrect', '')),
    serial_7s_attempt_4 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (serial_7s_attempt_4 IN ('correct', 'incorrect', '')),
    serial_7s_attempt_5 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (serial_7s_attempt_5 IN ('correct', 'incorrect', '')),

    -- WORLD backwards: D-L-R-O-W
    world_letter_1 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (world_letter_1 IN ('correct', 'incorrect', '')),
    world_letter_2 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (world_letter_2 IN ('correct', 'incorrect', '')),
    world_letter_3 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (world_letter_3 IN ('correct', 'incorrect', '')),
    world_letter_4 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (world_letter_4 IN ('correct', 'incorrect', '')),
    world_letter_5 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (world_letter_5 IN ('correct', 'incorrect', '')),

    attention_score INTEGER
        CHECK (attention_score IS NULL OR (attention_score >= 0 AND attention_score <= 5)),
    attention_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_attention_calculation_updated_at
    BEFORE UPDATE ON assessment_attention_calculation
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_attention_calculation IS
    'Attention and calculation section (MMSE items 14-18): serial 7s or WORLD backwards (5 points). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_attention_calculation.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_attention_calculation.test_used IS
    'Which attention test was used: serial-7s or world-backwards, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.serial_7s_attempt_1 IS
    'Serial 7s first subtraction (100-7=93): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.serial_7s_attempt_2 IS
    'Serial 7s second subtraction (93-7=86): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.serial_7s_attempt_3 IS
    'Serial 7s third subtraction (86-7=79): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.serial_7s_attempt_4 IS
    'Serial 7s fourth subtraction (79-7=72): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.serial_7s_attempt_5 IS
    'Serial 7s fifth subtraction (72-7=65): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.world_letter_1 IS
    'WORLD backwards first letter (D): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.world_letter_2 IS
    'WORLD backwards second letter (L): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.world_letter_3 IS
    'WORLD backwards third letter (R): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.world_letter_4 IS
    'WORLD backwards fourth letter (O): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.world_letter_5 IS
    'WORLD backwards fifth letter (W): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_attention_calculation.attention_score IS
    'Subtotal score for attention and calculation, 0-5.';
COMMENT ON COLUMN assessment_attention_calculation.attention_notes IS
    'Additional clinician notes on attention and calculation assessment.';
