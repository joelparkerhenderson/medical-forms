-- 07_assessment_sleep_efficiency.sql
-- Sleep efficiency section of the sleep quality assessment (PSQI Component 4).

CREATE TABLE assessment_sleep_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PSQI derived: sleep efficiency = (actual sleep hours / time in bed) * 100
    sleep_efficiency_percent NUMERIC(5,1)
        CHECK (sleep_efficiency_percent IS NULL OR (sleep_efficiency_percent >= 0 AND sleep_efficiency_percent <= 100)),

    time_awake_in_bed_minutes INTEGER
        CHECK (time_awake_in_bed_minutes IS NULL OR time_awake_in_bed_minutes >= 0),
    number_of_awakenings INTEGER
        CHECK (number_of_awakenings IS NULL OR number_of_awakenings >= 0),
    time_to_return_to_sleep_minutes INTEGER
        CHECK (time_to_return_to_sleep_minutes IS NULL OR time_to_return_to_sleep_minutes >= 0),
    early_morning_awakening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (early_morning_awakening IN ('yes', 'no', '')),
    early_awakening_time TIME,
    difficulty_returning_to_sleep VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficulty_returning_to_sleep IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_efficiency_updated_at
    BEFORE UPDATE ON assessment_sleep_efficiency
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_efficiency IS
    'Sleep efficiency section (PSQI Component 4): ratio of actual sleep to time in bed and nocturnal awakenings. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_efficiency.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_efficiency.sleep_efficiency_percent IS
    'Sleep efficiency percentage: (actual sleep hours / time in bed hours) * 100.';
COMMENT ON COLUMN assessment_sleep_efficiency.time_awake_in_bed_minutes IS
    'Total minutes spent awake in bed per night.';
COMMENT ON COLUMN assessment_sleep_efficiency.number_of_awakenings IS
    'Typical number of nocturnal awakenings per night.';
COMMENT ON COLUMN assessment_sleep_efficiency.time_to_return_to_sleep_minutes IS
    'Average time in minutes to return to sleep after waking.';
COMMENT ON COLUMN assessment_sleep_efficiency.early_morning_awakening IS
    'Whether patient experiences early morning awakening.';
COMMENT ON COLUMN assessment_sleep_efficiency.early_awakening_time IS
    'Typical early morning awakening time if applicable.';
COMMENT ON COLUMN assessment_sleep_efficiency.difficulty_returning_to_sleep IS
    'Whether patient has difficulty returning to sleep after waking.';
