-- 05_assessment_heart_failure_symptoms.sql
-- Heart failure symptoms section of the cardiology assessment.

CREATE TABLE assessment_heart_failure_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_dyspnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_dyspnoea IN ('yes', 'no', '')),
    dyspnoea_on_exertion VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyspnoea_on_exertion IN ('yes', 'no', '')),
    orthopnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orthopnoea IN ('yes', 'no', '')),
    pillows_required INTEGER
        CHECK (pillows_required IS NULL OR (pillows_required >= 0 AND pillows_required <= 10)),
    paroxysmal_nocturnal_dyspnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (paroxysmal_nocturnal_dyspnoea IN ('yes', 'no', '')),
    peripheral_oedema VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (peripheral_oedema IN ('yes', 'no', '')),
    oedema_location VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (oedema_location IN ('ankles', 'legs', 'sacral', 'generalised', '')),
    fatigue_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (fatigue_level IN ('none', 'mild', 'moderate', 'severe', '')),
    weight_gain_recent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (weight_gain_recent IN ('yes', 'no', '')),
    weight_gain_kg NUMERIC(5,1),
    nyha_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nyha_class IN ('I', 'II', 'III', 'IV', '')),
    heart_failure_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_heart_failure_symptoms_updated_at
    BEFORE UPDATE ON assessment_heart_failure_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_heart_failure_symptoms IS
    'Heart failure symptoms section: dyspnoea, oedema, fatigue, NYHA classification. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_heart_failure_symptoms.has_dyspnoea IS
    'Whether the patient experiences breathlessness: yes, no, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.dyspnoea_on_exertion IS
    'Whether dyspnoea occurs on exertion: yes, no, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.orthopnoea IS
    'Whether the patient experiences orthopnoea (breathlessness when lying flat): yes, no, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.pillows_required IS
    'Number of pillows needed to sleep comfortably.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.paroxysmal_nocturnal_dyspnoea IS
    'Whether the patient wakes at night with breathlessness (PND): yes, no, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.peripheral_oedema IS
    'Whether the patient has peripheral oedema (swelling): yes, no, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.oedema_location IS
    'Location of oedema: ankles, legs, sacral, generalised, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.fatigue_level IS
    'Self-reported fatigue severity: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.weight_gain_recent IS
    'Whether there has been recent unexplained weight gain: yes, no, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.weight_gain_kg IS
    'Amount of recent weight gain in kilograms, if applicable.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.nyha_class IS
    'New York Heart Association functional classification: I, II, III, IV, or empty.';
COMMENT ON COLUMN assessment_heart_failure_symptoms.heart_failure_notes IS
    'Additional clinician notes on heart failure symptoms.';
