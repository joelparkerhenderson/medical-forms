-- 06_assessment_mood_and_affect.sql
-- Mood and affect section of the mental health assessment.

CREATE TABLE assessment_mood_and_affect (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    current_mood VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (current_mood IN ('euthymic', 'depressed', 'anxious', 'irritable', 'elevated', 'flat', '')),
    mood_stability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mood_stability IN ('stable', 'labile', 'fluctuating', '')),
    affect VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (affect IN ('congruent', 'incongruent', 'restricted', 'blunted', 'flat', 'labile', '')),
    sleep_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_quality IN ('good', 'fair', 'poor', 'very-poor', '')),
    sleep_hours_per_night NUMERIC(3,1),
    appetite VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite IN ('normal', 'increased', 'decreased', '')),
    energy_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (energy_level IN ('normal', 'increased', 'decreased', '')),
    motivation_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (motivation_level IN ('normal', 'increased', 'decreased', '')),
    anhedonia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anhedonia IN ('yes', 'no', '')),
    irritability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (irritability IN ('yes', 'no', '')),
    psychomotor_changes VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (psychomotor_changes IN ('retardation', 'agitation', 'none', '')),
    mood_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mood_and_affect_updated_at
    BEFORE UPDATE ON assessment_mood_and_affect
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mood_and_affect IS
    'Mood and affect section: current mood, affect, sleep, appetite, energy, and psychomotor observations. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mood_and_affect.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mood_and_affect.current_mood IS
    'Patient current mood: euthymic, depressed, anxious, irritable, elevated, flat, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.mood_stability IS
    'Mood stability: stable, labile, fluctuating, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.affect IS
    'Observed affect: congruent, incongruent, restricted, blunted, flat, labile, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.sleep_quality IS
    'Self-reported sleep quality: good, fair, poor, very-poor, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.sleep_hours_per_night IS
    'Average hours of sleep per night.';
COMMENT ON COLUMN assessment_mood_and_affect.appetite IS
    'Appetite level: normal, increased, decreased, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.energy_level IS
    'Energy level: normal, increased, decreased, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.motivation_level IS
    'Motivation level: normal, increased, decreased, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.anhedonia IS
    'Whether the patient reports anhedonia (loss of pleasure): yes, no, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.irritability IS
    'Whether the patient reports irritability: yes, no, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.psychomotor_changes IS
    'Psychomotor changes: retardation, agitation, none, or empty string.';
COMMENT ON COLUMN assessment_mood_and_affect.mood_notes IS
    'Free-text clinician observations on mood and affect.';
