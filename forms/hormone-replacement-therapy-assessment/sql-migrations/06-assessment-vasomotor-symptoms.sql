-- 06_assessment_vasomotor_symptoms.sql
-- Vasomotor symptoms section of the HRT assessment.

CREATE TABLE assessment_vasomotor_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hot_flushes_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hot_flushes_present IN ('yes', 'no', '')),
    hot_flush_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hot_flush_frequency IN ('less-than-daily', 'daily', 'multiple-daily', 'hourly', '')),
    hot_flush_severity INTEGER
        CHECK (hot_flush_severity IS NULL OR (hot_flush_severity >= 1 AND hot_flush_severity <= 10)),
    hot_flush_duration_minutes INTEGER
        CHECK (hot_flush_duration_minutes IS NULL OR hot_flush_duration_minutes >= 0),
    night_sweats VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (night_sweats IN ('yes', 'no', '')),
    night_sweat_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (night_sweat_frequency IN ('occasional', 'most-nights', 'every-night', 'multiple-per-night', '')),
    sleep_disruption VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_disruption IN ('yes', 'no', '')),
    sleep_disruption_severity INTEGER
        CHECK (sleep_disruption_severity IS NULL OR (sleep_disruption_severity >= 1 AND sleep_disruption_severity <= 10)),
    palpitations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (palpitations IN ('yes', 'no', '')),
    impact_on_work VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_work IN ('none', 'mild', 'moderate', 'severe', '')),
    impact_on_social_life VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_social_life IN ('none', 'mild', 'moderate', 'severe', '')),
    previous_vasomotor_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_vasomotor_treatment IN ('yes', 'no', '')),
    previous_treatment_details TEXT NOT NULL DEFAULT '',
    vasomotor_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_vasomotor_symptoms_updated_at
    BEFORE UPDATE ON assessment_vasomotor_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_vasomotor_symptoms IS
    'Vasomotor symptoms section: hot flushes, night sweats, palpitations, and impact on daily life. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_vasomotor_symptoms.hot_flushes_present IS
    'Whether hot flushes are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.hot_flush_frequency IS
    'Hot flush frequency: less-than-daily, daily, multiple-daily, hourly, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.hot_flush_severity IS
    'Hot flush severity from 1 (mild) to 10 (severe), NULL if unanswered.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.hot_flush_duration_minutes IS
    'Average duration of hot flush episodes in minutes, NULL if unanswered.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.night_sweats IS
    'Whether night sweats are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.night_sweat_frequency IS
    'Night sweat frequency: occasional, most-nights, every-night, multiple-per-night, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.sleep_disruption IS
    'Whether sleep is disrupted by vasomotor symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.sleep_disruption_severity IS
    'Sleep disruption severity from 1 (mild) to 10 (severe), NULL if unanswered.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.palpitations IS
    'Whether palpitations are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.impact_on_work IS
    'Impact on work: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.impact_on_social_life IS
    'Impact on social life: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.previous_vasomotor_treatment IS
    'Whether previous treatment for vasomotor symptoms has been tried: yes, no, or empty string.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.previous_treatment_details IS
    'Details of previous vasomotor treatment.';
COMMENT ON COLUMN assessment_vasomotor_symptoms.vasomotor_notes IS
    'Free-text notes on vasomotor symptoms.';
