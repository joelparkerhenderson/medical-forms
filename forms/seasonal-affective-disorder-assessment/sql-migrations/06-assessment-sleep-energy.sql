-- 06_assessment_sleep_energy.sql
-- Sleep and energy section of the seasonal affective disorder assessment.

CREATE TABLE assessment_sleep_energy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    average_sleep_hours NUMERIC(3,1)
        CHECK (average_sleep_hours IS NULL OR (average_sleep_hours >= 0 AND average_sleep_hours <= 24)),
    sleep_quality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sleep_quality IN ('good', 'fair', 'poor', 'very-poor', '')),
    difficulty_waking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (difficulty_waking IN ('yes', 'no', '')),
    hypersomnia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypersomnia IN ('yes', 'no', '')),
    hypersomnia_hours NUMERIC(3,1)
        CHECK (hypersomnia_hours IS NULL OR (hypersomnia_hours >= 0 AND hypersomnia_hours <= 24)),
    daytime_sleepiness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (daytime_sleepiness IN ('none', 'mild', 'moderate', 'severe', '')),
    energy_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (energy_level IN ('normal', 'low', 'very-low', 'exhausted', '')),
    energy_worst_time VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (energy_worst_time IN ('morning', 'afternoon', 'evening', 'all-day', '')),
    fatigue_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (fatigue_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    sleep_energy_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sleep_energy_updated_at
    BEFORE UPDATE ON assessment_sleep_energy
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sleep_energy IS
    'Sleep and energy section: sleep patterns, hypersomnia, daytime sleepiness, and energy levels. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sleep_energy.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sleep_energy.average_sleep_hours IS
    'Average hours of sleep per night.';
COMMENT ON COLUMN assessment_sleep_energy.sleep_quality IS
    'Self-reported sleep quality: good, fair, poor, very-poor, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.difficulty_waking IS
    'Whether the patient has difficulty waking in the morning: yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.hypersomnia IS
    'Whether the patient experiences excessive sleeping (hypersomnia): yes, no, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.hypersomnia_hours IS
    'Total hours of sleep when experiencing hypersomnia.';
COMMENT ON COLUMN assessment_sleep_energy.daytime_sleepiness IS
    'Severity of daytime sleepiness: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.energy_level IS
    'Current energy level: normal, low, very-low, exhausted, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.energy_worst_time IS
    'Time of day when energy is worst: morning, afternoon, evening, all-day, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.fatigue_impact IS
    'Impact of fatigue on daily activities: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_sleep_energy.sleep_energy_notes IS
    'Additional clinician notes on sleep and energy.';
