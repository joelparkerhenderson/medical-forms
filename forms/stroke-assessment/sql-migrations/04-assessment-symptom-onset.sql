-- 04_assessment_symptom_onset.sql
-- Symptom onset section of the stroke assessment.

CREATE TABLE assessment_symptom_onset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    symptom_onset_time TIMESTAMPTZ,
    last_known_well_time TIMESTAMPTZ,
    onset_witnessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (onset_witnessed IN ('yes', 'no', '')),
    wake_up_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wake_up_stroke IN ('yes', 'no', '')),
    onset_setting VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (onset_setting IN ('home', 'work', 'public', 'hospital', 'other', '')),
    onset_activity TEXT NOT NULL DEFAULT '',
    symptom_progression VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (symptom_progression IN ('sudden', 'stepwise', 'gradual', 'fluctuating', 'improving', '')),
    initial_symptoms TEXT NOT NULL DEFAULT '',
    headache_at_onset VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (headache_at_onset IN ('yes', 'no', '')),
    seizure_at_onset VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seizure_at_onset IN ('yes', 'no', '')),
    vomiting_at_onset VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vomiting_at_onset IN ('yes', 'no', '')),
    loss_of_consciousness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (loss_of_consciousness IN ('yes', 'no', '')),
    time_from_onset_to_arrival_minutes INTEGER
        CHECK (time_from_onset_to_arrival_minutes IS NULL OR time_from_onset_to_arrival_minutes >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_symptom_onset_updated_at
    BEFORE UPDATE ON assessment_symptom_onset
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_symptom_onset IS
    'Symptom onset section: timing, circumstances, and progression of stroke symptoms. Critical for thrombolysis eligibility. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_symptom_onset.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_symptom_onset.symptom_onset_time IS
    'Time of symptom onset (critical for thrombolysis window).';
COMMENT ON COLUMN assessment_symptom_onset.last_known_well_time IS
    'Last time the patient was known to be at neurological baseline.';
COMMENT ON COLUMN assessment_symptom_onset.onset_witnessed IS
    'Whether symptom onset was witnessed.';
COMMENT ON COLUMN assessment_symptom_onset.wake_up_stroke IS
    'Whether symptoms were present on waking (unknown onset time).';
COMMENT ON COLUMN assessment_symptom_onset.onset_setting IS
    'Setting where symptoms began: home, work, public, hospital, other, or empty string.';
COMMENT ON COLUMN assessment_symptom_onset.onset_activity IS
    'Activity at time of symptom onset.';
COMMENT ON COLUMN assessment_symptom_onset.symptom_progression IS
    'Pattern of symptom progression: sudden, stepwise, gradual, fluctuating, improving, or empty string.';
COMMENT ON COLUMN assessment_symptom_onset.initial_symptoms IS
    'Free-text description of initial presenting symptoms.';
COMMENT ON COLUMN assessment_symptom_onset.headache_at_onset IS
    'Whether severe headache was present at onset (possible haemorrhagic stroke indicator).';
COMMENT ON COLUMN assessment_symptom_onset.seizure_at_onset IS
    'Whether seizure occurred at onset.';
COMMENT ON COLUMN assessment_symptom_onset.vomiting_at_onset IS
    'Whether vomiting occurred at onset (possible posterior circulation or haemorrhagic stroke).';
COMMENT ON COLUMN assessment_symptom_onset.loss_of_consciousness IS
    'Whether loss of consciousness occurred.';
COMMENT ON COLUMN assessment_symptom_onset.time_from_onset_to_arrival_minutes IS
    'Time in minutes from symptom onset to hospital arrival.';
