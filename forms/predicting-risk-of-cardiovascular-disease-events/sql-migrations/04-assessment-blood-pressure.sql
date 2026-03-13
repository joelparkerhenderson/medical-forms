-- ============================================================
-- 04_assessment_blood_pressure.sql
-- Step 3: Blood Pressure (1:1 with assessment).
-- ============================================================
-- Blood pressure readings and antihypertensive treatment status.
-- Systolic BP is a primary input to the PREVENT risk model.
-- ============================================================

CREATE TABLE assessment_blood_pressure (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Blood pressure readings
    systolic_bp                 NUMERIC(5,1) CHECK (systolic_bp IS NULL OR (systolic_bp >= 60 AND systolic_bp <= 300)),
    diastolic_bp                NUMERIC(5,1) CHECK (diastolic_bp IS NULL OR (diastolic_bp >= 30 AND diastolic_bp <= 200)),

    -- Antihypertensive treatment
    on_antihypertensive         TEXT NOT NULL DEFAULT ''
                                CHECK (on_antihypertensive IN ('yes', 'no', '')),
    number_of_bp_medications    SMALLINT CHECK (number_of_bp_medications IS NULL OR (number_of_bp_medications >= 0 AND number_of_bp_medications <= 10)),
    bp_at_target                TEXT NOT NULL DEFAULT ''
                                CHECK (bp_at_target IN ('yes', 'no', 'unknown', '')),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_blood_pressure_updated_at
    BEFORE UPDATE ON assessment_blood_pressure
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_blood_pressure IS
    '1:1 with assessment. Step 3: Blood pressure readings and antihypertensive treatment status.';
COMMENT ON COLUMN assessment_blood_pressure.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_blood_pressure.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_blood_pressure.systolic_bp IS
    'Systolic blood pressure in mmHg. NULL if not recorded. Primary PREVENT model input.';
COMMENT ON COLUMN assessment_blood_pressure.diastolic_bp IS
    'Diastolic blood pressure in mmHg. NULL if not recorded.';
COMMENT ON COLUMN assessment_blood_pressure.on_antihypertensive IS
    'Whether patient is on antihypertensive medication: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_blood_pressure.number_of_bp_medications IS
    'Number of BP medications if on antihypertensive therapy. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_pressure.bp_at_target IS
    'Whether BP is at target: yes, no, unknown, or empty string if unanswered.';
COMMENT ON COLUMN assessment_blood_pressure.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_blood_pressure.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
