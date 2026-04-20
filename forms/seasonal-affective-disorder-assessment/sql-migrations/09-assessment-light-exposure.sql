-- 09_assessment_light_exposure.sql
-- Light exposure assessment section of the seasonal affective disorder assessment.

CREATE TABLE assessment_light_exposure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    daily_outdoor_minutes INTEGER
        CHECK (daily_outdoor_minutes IS NULL OR (daily_outdoor_minutes >= 0 AND daily_outdoor_minutes <= 1440)),
    outdoor_time_of_day VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (outdoor_time_of_day IN ('morning', 'midday', 'afternoon', 'varies', '')),
    workplace_natural_light VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (workplace_natural_light IN ('good', 'moderate', 'poor', 'none', '')),
    home_natural_light VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (home_natural_light IN ('good', 'moderate', 'poor', 'none', '')),
    latitude_awareness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latitude_awareness IN ('yes', 'no', '')),
    uses_light_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_light_therapy IN ('yes', 'no', '')),
    light_therapy_details TEXT NOT NULL DEFAULT '',
    light_therapy_duration_minutes INTEGER
        CHECK (light_therapy_duration_minutes IS NULL OR light_therapy_duration_minutes >= 0),
    light_therapy_lux INTEGER
        CHECK (light_therapy_lux IS NULL OR light_therapy_lux >= 0),
    dawn_simulator VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dawn_simulator IN ('yes', 'no', '')),
    light_exposure_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_light_exposure_updated_at
    BEFORE UPDATE ON assessment_light_exposure
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_light_exposure IS
    'Light exposure assessment section: outdoor time, natural light, light therapy use. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_light_exposure.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_light_exposure.daily_outdoor_minutes IS
    'Average daily time spent outdoors in minutes.';
COMMENT ON COLUMN assessment_light_exposure.outdoor_time_of_day IS
    'Usual time of day for outdoor exposure: morning, midday, afternoon, varies, or empty.';
COMMENT ON COLUMN assessment_light_exposure.workplace_natural_light IS
    'Quality of natural light in workplace: good, moderate, poor, none, or empty.';
COMMENT ON COLUMN assessment_light_exposure.home_natural_light IS
    'Quality of natural light at home: good, moderate, poor, none, or empty.';
COMMENT ON COLUMN assessment_light_exposure.latitude_awareness IS
    'Whether the patient is aware of latitude effects on seasonal mood: yes, no, or empty.';
COMMENT ON COLUMN assessment_light_exposure.uses_light_therapy IS
    'Whether the patient currently uses light therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_light_exposure.light_therapy_details IS
    'Details of light therapy device and schedule.';
COMMENT ON COLUMN assessment_light_exposure.light_therapy_duration_minutes IS
    'Duration of daily light therapy session in minutes.';
COMMENT ON COLUMN assessment_light_exposure.light_therapy_lux IS
    'Intensity of light therapy device in lux.';
COMMENT ON COLUMN assessment_light_exposure.dawn_simulator IS
    'Whether the patient uses a dawn simulator: yes, no, or empty.';
COMMENT ON COLUMN assessment_light_exposure.light_exposure_notes IS
    'Additional clinician notes on light exposure assessment.';
