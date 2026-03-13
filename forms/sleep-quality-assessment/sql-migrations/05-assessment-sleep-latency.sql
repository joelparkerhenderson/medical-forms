-- 05_assessment_sleep_latency.sql
-- Sleep latency section of the sleep quality assessment (PSQI Component 2).

CREATE TABLE assessment_sleep_latency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PSQI Q2: time to fall asleep
    time_to_fall_asleep_minutes INTEGER
        CHECK (time_to_fall_asleep_minutes IS NULL OR time_to_fall_asleep_minutes >= 0),

    -- PSQI Q5a: cannot get to sleep within 30 minutes
    cannot_sleep_within_30_min INTEGER
        CHECK (cannot_sleep_within_30_min IS NULL OR (cannot_sleep_within_30_min >= 0 AND cannot_sleep_within_30_min <= 3)),

    racing_thoughts_at_bedtime VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (racing_thoughts_at_bedtime IN ('yes', 'no', '')),
    physical_discomfort_at_bedtime VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (physical_discomfort_at_bedtime IN ('yes', 'no', '')),
    anxiety_at_bedtime VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_at_bedtime IN ('yes', 'no', '')),
    difficulty_relaxing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficulty_relaxing IN ('yes', 'no', '')),
    sleep_onset_strategies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_latency_updated_at
    BEFORE UPDATE ON assessment_sleep_latency
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_latency IS
    'Sleep latency section (PSQI Component 2): time to fall asleep and factors affecting onset. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_latency.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_latency.time_to_fall_asleep_minutes IS
    'PSQI Q2: typical time in minutes to fall asleep after going to bed.';
COMMENT ON COLUMN assessment_sleep_latency.cannot_sleep_within_30_min IS
    'PSQI Q5a: frequency of not falling asleep within 30 minutes; 0=not at all, 1=less than once/week, 2=once or twice/week, 3=three or more times/week.';
COMMENT ON COLUMN assessment_sleep_latency.racing_thoughts_at_bedtime IS
    'Whether patient experiences racing thoughts at bedtime.';
COMMENT ON COLUMN assessment_sleep_latency.physical_discomfort_at_bedtime IS
    'Whether physical discomfort delays sleep onset.';
COMMENT ON COLUMN assessment_sleep_latency.anxiety_at_bedtime IS
    'Whether anxiety contributes to sleep onset difficulty.';
COMMENT ON COLUMN assessment_sleep_latency.difficulty_relaxing IS
    'Whether patient has difficulty relaxing at bedtime.';
COMMENT ON COLUMN assessment_sleep_latency.sleep_onset_strategies IS
    'Free-text description of strategies used to fall asleep.';
