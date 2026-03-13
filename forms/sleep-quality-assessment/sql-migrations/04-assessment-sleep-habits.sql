-- 04_assessment_sleep_habits.sql
-- Sleep habits section of the sleep quality assessment.

CREATE TABLE assessment_sleep_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    usual_bedtime TIME,
    usual_wake_time TIME,
    time_in_bed_hours NUMERIC(4,1)
        CHECK (time_in_bed_hours IS NULL OR (time_in_bed_hours >= 0 AND time_in_bed_hours <= 24)),
    nap_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (nap_frequency IN ('daily', 'several_per_week', 'weekly', 'rarely', 'never', '')),
    nap_duration_minutes INTEGER
        CHECK (nap_duration_minutes IS NULL OR nap_duration_minutes >= 0),
    sleep_environment_noise VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_environment_noise IN ('quiet', 'some_noise', 'noisy', '')),
    sleep_environment_light VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_environment_light IN ('dark', 'dim', 'light', '')),
    sleep_environment_temperature VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_environment_temperature IN ('cool', 'comfortable', 'warm', 'hot', '')),
    screen_use_before_bed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (screen_use_before_bed IN ('yes', 'no', '')),
    screen_use_duration_minutes INTEGER
        CHECK (screen_use_duration_minutes IS NULL OR screen_use_duration_minutes >= 0),
    bed_partner VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bed_partner IN ('yes', 'no', '')),
    bed_partner_sleep_issues TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_habits_updated_at
    BEFORE UPDATE ON assessment_sleep_habits
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_habits IS
    'Sleep habits section: bedtime routine, environment, and sleep hygiene factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_habits.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_habits.usual_bedtime IS
    'Usual time the patient goes to bed.';
COMMENT ON COLUMN assessment_sleep_habits.usual_wake_time IS
    'Usual time the patient wakes up.';
COMMENT ON COLUMN assessment_sleep_habits.time_in_bed_hours IS
    'Total hours spent in bed per night.';
COMMENT ON COLUMN assessment_sleep_habits.nap_frequency IS
    'Frequency of daytime napping: daily, several_per_week, weekly, rarely, never, or empty string.';
COMMENT ON COLUMN assessment_sleep_habits.nap_duration_minutes IS
    'Typical nap duration in minutes.';
COMMENT ON COLUMN assessment_sleep_habits.sleep_environment_noise IS
    'Sleep environment noise level: quiet, some_noise, noisy, or empty string.';
COMMENT ON COLUMN assessment_sleep_habits.sleep_environment_light IS
    'Sleep environment light level: dark, dim, light, or empty string.';
COMMENT ON COLUMN assessment_sleep_habits.sleep_environment_temperature IS
    'Sleep environment temperature: cool, comfortable, warm, hot, or empty string.';
COMMENT ON COLUMN assessment_sleep_habits.screen_use_before_bed IS
    'Whether patient uses screens (phone, tablet, TV) before bed.';
COMMENT ON COLUMN assessment_sleep_habits.screen_use_duration_minutes IS
    'Duration of screen use before bed in minutes.';
COMMENT ON COLUMN assessment_sleep_habits.bed_partner IS
    'Whether patient has a bed partner.';
COMMENT ON COLUMN assessment_sleep_habits.bed_partner_sleep_issues IS
    'Bed partner reported sleep issues (e.g. snoring observed, apnoea episodes).';
