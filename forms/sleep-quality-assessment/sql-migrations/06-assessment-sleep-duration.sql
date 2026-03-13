-- 06_assessment_sleep_duration.sql
-- Sleep duration section of the sleep quality assessment (PSQI Component 3).

CREATE TABLE assessment_sleep_duration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PSQI Q4: actual hours of sleep
    actual_sleep_hours NUMERIC(4,1)
        CHECK (actual_sleep_hours IS NULL OR (actual_sleep_hours >= 0 AND actual_sleep_hours <= 24)),

    sleep_duration_weekday_hours NUMERIC(4,1)
        CHECK (sleep_duration_weekday_hours IS NULL OR (sleep_duration_weekday_hours >= 0 AND sleep_duration_weekday_hours <= 24)),
    sleep_duration_weekend_hours NUMERIC(4,1)
        CHECK (sleep_duration_weekend_hours IS NULL OR (sleep_duration_weekend_hours >= 0 AND sleep_duration_weekend_hours <= 24)),
    sleep_duration_variability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_duration_variability IN ('consistent', 'somewhat_variable', 'highly_variable', '')),
    perceived_sleep_need_hours NUMERIC(4,1)
        CHECK (perceived_sleep_need_hours IS NULL OR (perceived_sleep_need_hours >= 0 AND perceived_sleep_need_hours <= 24)),
    sleep_debt_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_debt_present IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_duration_updated_at
    BEFORE UPDATE ON assessment_sleep_duration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_duration IS
    'Sleep duration section (PSQI Component 3): actual sleep time and weekday/weekend patterns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_duration.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_duration.actual_sleep_hours IS
    'PSQI Q4: actual hours of sleep per night (not time in bed).';
COMMENT ON COLUMN assessment_sleep_duration.sleep_duration_weekday_hours IS
    'Typical weekday sleep duration in hours.';
COMMENT ON COLUMN assessment_sleep_duration.sleep_duration_weekend_hours IS
    'Typical weekend sleep duration in hours.';
COMMENT ON COLUMN assessment_sleep_duration.sleep_duration_variability IS
    'Variability in sleep duration: consistent, somewhat_variable, highly_variable, or empty string.';
COMMENT ON COLUMN assessment_sleep_duration.perceived_sleep_need_hours IS
    'Patient perceived ideal sleep duration in hours.';
COMMENT ON COLUMN assessment_sleep_duration.sleep_debt_present IS
    'Whether significant sleep debt is present.';
