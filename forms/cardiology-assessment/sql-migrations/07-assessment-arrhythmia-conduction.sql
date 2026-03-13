-- 07_assessment_arrhythmia_conduction.sql
-- Arrhythmia and conduction section of the cardiology assessment.

CREATE TABLE assessment_arrhythmia_conduction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_palpitations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_palpitations IN ('yes', 'no', '')),
    palpitation_character VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (palpitation_character IN ('regular', 'irregular', 'fast', 'slow', 'missed-beats', '')),
    palpitation_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (palpitation_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    known_atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_atrial_fibrillation IN ('yes', 'no', '')),
    af_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (af_type IN ('paroxysmal', 'persistent', 'permanent', '')),
    history_of_syncope VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_syncope IN ('yes', 'no', '')),
    syncope_details TEXT NOT NULL DEFAULT '',
    history_of_presyncope VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_presyncope IN ('yes', 'no', '')),
    known_conduction_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_conduction_disorder IN ('yes', 'no', '')),
    conduction_disorder_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (conduction_disorder_type IN ('lbbb', 'rbbb', 'first-degree-avb', 'second-degree-avb', 'third-degree-avb', 'wpw', 'other', '')),
    has_pacemaker VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_pacemaker IN ('yes', 'no', '')),
    has_icd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_icd IN ('yes', 'no', '')),
    device_details TEXT NOT NULL DEFAULT '',
    arrhythmia_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_arrhythmia_conduction_updated_at
    BEFORE UPDATE ON assessment_arrhythmia_conduction
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_arrhythmia_conduction IS
    'Arrhythmia and conduction section: palpitations, AF, syncope, conduction disorders, and cardiac devices. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_arrhythmia_conduction.has_palpitations IS
    'Whether the patient experiences palpitations: yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.palpitation_character IS
    'Character of palpitations: regular, irregular, fast, slow, missed-beats, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.palpitation_frequency IS
    'Frequency of palpitations: daily, weekly, monthly, rarely, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.known_atrial_fibrillation IS
    'Whether the patient has known atrial fibrillation: yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.af_type IS
    'Type of atrial fibrillation: paroxysmal, persistent, permanent, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.history_of_syncope IS
    'Whether the patient has a history of syncope (fainting): yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.syncope_details IS
    'Details of syncope episodes including circumstances and frequency.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.history_of_presyncope IS
    'Whether the patient has a history of pre-syncope (near-fainting): yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.known_conduction_disorder IS
    'Whether the patient has a known conduction disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.conduction_disorder_type IS
    'Type of conduction disorder: lbbb, rbbb, first-degree-avb, second-degree-avb, third-degree-avb, wpw, other, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.has_pacemaker IS
    'Whether the patient has a permanent pacemaker: yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.has_icd IS
    'Whether the patient has an implantable cardioverter-defibrillator: yes, no, or empty.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.device_details IS
    'Details of pacemaker or ICD including implant date and model.';
COMMENT ON COLUMN assessment_arrhythmia_conduction.arrhythmia_notes IS
    'Additional clinician notes on arrhythmia and conduction.';
