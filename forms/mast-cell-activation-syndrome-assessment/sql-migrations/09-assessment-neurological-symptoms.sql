-- 09_assessment_neurological_symptoms.sql
-- Neurological symptoms section of the MCAS assessment.

CREATE TABLE assessment_neurological_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    headaches VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (headaches IN ('yes', 'no', '')),
    headache_severity INTEGER
        CHECK (headache_severity IS NULL OR (headache_severity >= 0 AND headache_severity <= 10)),
    headache_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (headache_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    brain_fog VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (brain_fog IN ('yes', 'no', '')),
    brain_fog_severity INTEGER
        CHECK (brain_fog_severity IS NULL OR (brain_fog_severity >= 0 AND brain_fog_severity <= 10)),
    dizziness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dizziness IN ('yes', 'no', '')),
    paraesthesia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (paraesthesia IN ('yes', 'no', '')),
    paraesthesia_location TEXT NOT NULL DEFAULT '',
    insomnia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (insomnia IN ('yes', 'no', '')),
    fatigue VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fatigue IN ('yes', 'no', '')),
    fatigue_severity INTEGER
        CHECK (fatigue_severity IS NULL OR (fatigue_severity >= 0 AND fatigue_severity <= 10)),
    anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety IN ('yes', 'no', '')),
    depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depression IN ('yes', 'no', '')),
    neurological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_neurological_symptoms_updated_at
    BEFORE UPDATE ON assessment_neurological_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_neurological_symptoms IS
    'Neurological symptoms section: headaches, brain fog, dizziness, paraesthesia, fatigue, and mood symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_neurological_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_neurological_symptoms.headaches IS
    'Whether the patient experiences headaches: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.headache_severity IS
    'Headache severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_neurological_symptoms.headache_frequency IS
    'How often headaches occur: daily, weekly, monthly, rarely, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.brain_fog IS
    'Whether the patient experiences brain fog or cognitive difficulty: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.brain_fog_severity IS
    'Brain fog severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_neurological_symptoms.dizziness IS
    'Whether the patient experiences dizziness: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.paraesthesia IS
    'Whether the patient experiences paraesthesia (tingling/numbness): yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.paraesthesia_location IS
    'Free-text description of paraesthesia location(s).';
COMMENT ON COLUMN assessment_neurological_symptoms.insomnia IS
    'Whether the patient experiences insomnia: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.fatigue IS
    'Whether the patient experiences significant fatigue: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.fatigue_severity IS
    'Fatigue severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_neurological_symptoms.anxiety IS
    'Whether the patient experiences anxiety symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.depression IS
    'Whether the patient experiences depressive symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurological_symptoms.neurological_notes IS
    'Free-text clinician notes on neurological findings.';
