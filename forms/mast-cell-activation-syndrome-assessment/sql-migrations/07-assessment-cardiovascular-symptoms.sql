-- 07_assessment_cardiovascular_symptoms.sql
-- Cardiovascular symptoms section of the MCAS assessment.

CREATE TABLE assessment_cardiovascular_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    tachycardia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tachycardia IN ('yes', 'no', '')),
    resting_heart_rate INTEGER
        CHECK (resting_heart_rate IS NULL OR (resting_heart_rate >= 20 AND resting_heart_rate <= 300)),
    hypotension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypotension IN ('yes', 'no', '')),
    systolic_bp INTEGER
        CHECK (systolic_bp IS NULL OR (systolic_bp >= 40 AND systolic_bp <= 300)),
    diastolic_bp INTEGER
        CHECK (diastolic_bp IS NULL OR (diastolic_bp >= 20 AND diastolic_bp <= 200)),
    presyncope VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (presyncope IN ('yes', 'no', '')),
    syncope VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (syncope IN ('yes', 'no', '')),
    syncope_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (syncope_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    palpitations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (palpitations IN ('yes', 'no', '')),
    chest_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chest_pain IN ('yes', 'no', '')),
    orthostatic_intolerance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orthostatic_intolerance IN ('yes', 'no', '')),
    anaphylaxis_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anaphylaxis_history IN ('yes', 'no', '')),
    anaphylaxis_episode_count INTEGER
        CHECK (anaphylaxis_episode_count IS NULL OR anaphylaxis_episode_count >= 0),
    carries_adrenaline_auto_injector VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carries_adrenaline_auto_injector IN ('yes', 'no', '')),
    cardiovascular_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_symptoms_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_symptoms IS
    'Cardiovascular symptoms section: tachycardia, hypotension, syncope, palpitations, and anaphylaxis history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.tachycardia IS
    'Whether the patient experiences tachycardia: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.resting_heart_rate IS
    'Resting heart rate in beats per minute.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.hypotension IS
    'Whether the patient experiences hypotension: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.systolic_bp IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.diastolic_bp IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.presyncope IS
    'Whether the patient experiences presyncope (near-fainting): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.syncope IS
    'Whether the patient experiences syncope (fainting): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.syncope_frequency IS
    'How often syncope occurs: daily, weekly, monthly, rarely, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.palpitations IS
    'Whether the patient experiences palpitations: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.chest_pain IS
    'Whether the patient experiences chest pain: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.orthostatic_intolerance IS
    'Whether the patient has orthostatic intolerance: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.anaphylaxis_history IS
    'Whether the patient has a history of anaphylaxis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.anaphylaxis_episode_count IS
    'Number of anaphylactic episodes experienced.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.carries_adrenaline_auto_injector IS
    'Whether the patient carries an adrenaline auto-injector (e.g. EpiPen): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_symptoms.cardiovascular_notes IS
    'Free-text clinician notes on cardiovascular findings.';
