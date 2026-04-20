-- 08_assessment_sleep_wake_cycle.sql
-- Sleep-wake cycle section of the sundowner syndrome assessment.

CREATE TABLE assessment_sleep_wake_cycle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    sleep_quality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sleep_quality IN ('good', 'fair', 'poor', 'very-poor', '')),
    typical_bedtime VARCHAR(10) NOT NULL DEFAULT '',
    typical_wake_time VARCHAR(10) NOT NULL DEFAULT '',
    sleep_duration_hours NUMERIC(3,1)
        CHECK (sleep_duration_hours IS NULL OR (sleep_duration_hours >= 0 AND sleep_duration_hours <= 24)),
    night_waking_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (night_waking_frequency IN ('none', 'once', 'twice', 'three-plus', 'frequent', '')),
    daytime_napping VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (daytime_napping IN ('yes', 'no', '')),
    nap_duration_hours NUMERIC(3,1)
        CHECK (nap_duration_hours IS NULL OR (nap_duration_hours >= 0 AND nap_duration_hours <= 12)),
    day_night_reversal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (day_night_reversal IN ('yes', 'no', '')),
    circadian_rhythm_disruption VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (circadian_rhythm_disruption IN ('none', 'mild', 'moderate', 'severe', '')),
    sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_apnoea IN ('yes', 'no', '')),
    restless_legs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (restless_legs IN ('yes', 'no', '')),
    sleep_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_medication IN ('yes', 'no', '')),
    sleep_medication_details TEXT NOT NULL DEFAULT '',
    light_exposure_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (light_exposure_adequate IN ('yes', 'no', '')),
    sleep_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_wake_cycle_updated_at
    BEFORE UPDATE ON assessment_sleep_wake_cycle
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_wake_cycle IS
    'Sleep-wake cycle section: sleep quality, circadian rhythm, napping, and sleep disorders. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_wake_cycle.sleep_quality IS
    'Self/carer-reported sleep quality: good, fair, poor, very-poor, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.typical_bedtime IS
    'Typical bedtime (e.g. 21:00).';
COMMENT ON COLUMN assessment_sleep_wake_cycle.typical_wake_time IS
    'Typical wake time (e.g. 06:00).';
COMMENT ON COLUMN assessment_sleep_wake_cycle.sleep_duration_hours IS
    'Typical total sleep duration in hours.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.night_waking_frequency IS
    'Frequency of night-time waking: none, once, twice, three-plus, frequent, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.daytime_napping IS
    'Whether the patient naps during the day: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.nap_duration_hours IS
    'Total daytime nap duration in hours.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.day_night_reversal IS
    'Whether there is reversal of the day-night sleep cycle: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.circadian_rhythm_disruption IS
    'Degree of circadian rhythm disruption: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.sleep_apnoea IS
    'Whether the patient has sleep apnoea: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.restless_legs IS
    'Whether the patient has restless legs syndrome: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.sleep_medication IS
    'Whether the patient takes sleep medication: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.sleep_medication_details IS
    'Details of sleep medications including name and dose.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.light_exposure_adequate IS
    'Whether the patient gets adequate natural light exposure during the day: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_wake_cycle.sleep_notes IS
    'Additional clinician notes on sleep-wake cycle.';
