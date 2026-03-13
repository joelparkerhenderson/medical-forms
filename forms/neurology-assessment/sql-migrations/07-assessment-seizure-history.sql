-- 07_assessment_seizure_history.sql
-- Seizure history section of the neurology assessment.

CREATE TABLE assessment_seizure_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    seizure_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seizure_history IN ('yes', 'no', '')),
    epilepsy_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epilepsy_diagnosis IN ('yes', 'no', '')),
    seizure_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (seizure_type IN ('focal-aware', 'focal-impaired-awareness', 'generalised-tonic-clonic', 'absence', 'myoclonic', 'atonic', 'unknown', '')),
    seizure_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (seizure_frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'single-episode', '')),
    last_seizure_date DATE,
    seizure_duration_typical VARCHAR(50) NOT NULL DEFAULT '',
    seizure_triggers TEXT NOT NULL DEFAULT '',
    aura_before_seizure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (aura_before_seizure IN ('yes', 'no', '')),
    aura_description TEXT NOT NULL DEFAULT '',
    postictal_symptoms TEXT NOT NULL DEFAULT '',
    status_epilepticus_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (status_epilepticus_history IN ('yes', 'no', '')),
    febrile_seizures_childhood VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (febrile_seizures_childhood IN ('yes', 'no', '')),
    family_history_epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_epilepsy IN ('yes', 'no', '')),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('driving', 'not-driving', 'dvla-notified', '')),
    seizure_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_seizure_history_updated_at
    BEFORE UPDATE ON assessment_seizure_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_seizure_history IS
    'Seizure history section: seizure type, frequency, triggers, postictal symptoms, and driving status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_seizure_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_seizure_history.seizure_history IS
    'Whether the patient has a history of seizures: yes, no, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.epilepsy_diagnosis IS
    'Whether the patient has a formal epilepsy diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.seizure_type IS
    'Seizure classification: focal-aware, focal-impaired-awareness, generalised-tonic-clonic, absence, myoclonic, atonic, unknown, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.seizure_frequency IS
    'How often seizures occur: daily, weekly, monthly, yearly, single-episode, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.last_seizure_date IS
    'Date of the most recent seizure.';
COMMENT ON COLUMN assessment_seizure_history.seizure_duration_typical IS
    'Typical duration of seizure episodes.';
COMMENT ON COLUMN assessment_seizure_history.seizure_triggers IS
    'Free-text description of known seizure triggers.';
COMMENT ON COLUMN assessment_seizure_history.aura_before_seizure IS
    'Whether the patient experiences an aura before seizures: yes, no, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.aura_description IS
    'Free-text description of the seizure aura.';
COMMENT ON COLUMN assessment_seizure_history.postictal_symptoms IS
    'Free-text description of postictal symptoms (confusion, fatigue, headache).';
COMMENT ON COLUMN assessment_seizure_history.status_epilepticus_history IS
    'Whether the patient has a history of status epilepticus: yes, no, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.febrile_seizures_childhood IS
    'Whether the patient had febrile seizures in childhood: yes, no, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.family_history_epilepsy IS
    'Whether there is a family history of epilepsy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.driving_status IS
    'Driving status: driving, not-driving, dvla-notified, or empty string.';
COMMENT ON COLUMN assessment_seizure_history.seizure_notes IS
    'Free-text clinician notes on seizure history.';
