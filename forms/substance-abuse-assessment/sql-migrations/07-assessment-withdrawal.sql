-- 07_assessment_withdrawal.sql
-- Withdrawal assessment section of the substance abuse assessment.

CREATE TABLE assessment_withdrawal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    currently_in_withdrawal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_in_withdrawal IN ('yes', 'no', '')),
    withdrawal_substance VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (withdrawal_substance IN ('alcohol', 'opioids', 'benzodiazepines', 'stimulants', 'multiple', 'other', '')),
    tremor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tremor IN ('yes', 'no', '')),
    sweating VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sweating IN ('yes', 'no', '')),
    nausea_vomiting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nausea_vomiting IN ('yes', 'no', '')),
    anxiety VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anxiety IN ('none', 'mild', 'moderate', 'severe', '')),
    agitation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (agitation IN ('none', 'mild', 'moderate', 'severe', '')),
    seizure_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seizure_history IN ('yes', 'no', '')),
    delirium_tremens_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (delirium_tremens_history IN ('yes', 'no', '')),
    hallucinations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hallucinations IN ('yes', 'no', '')),
    last_drink_drug_hours INTEGER
        CHECK (last_drink_drug_hours IS NULL OR last_drink_drug_hours >= 0),
    withdrawal_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (withdrawal_severity IN ('none', 'mild', 'moderate', 'severe', '')),
    medically_supervised_detox_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (medically_supervised_detox_needed IN ('yes', 'no', '')),
    withdrawal_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_withdrawal_updated_at
    BEFORE UPDATE ON assessment_withdrawal
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_withdrawal IS
    'Withdrawal assessment section: symptoms, severity, seizure and delirium tremens history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_withdrawal.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_withdrawal.currently_in_withdrawal IS
    'Whether the patient is currently experiencing withdrawal: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.withdrawal_substance IS
    'Substance causing withdrawal: alcohol, opioids, benzodiazepines, stimulants, multiple, other, or empty.';
COMMENT ON COLUMN assessment_withdrawal.tremor IS
    'Whether the patient has tremor: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.sweating IS
    'Whether the patient has sweating: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.nausea_vomiting IS
    'Whether the patient has nausea or vomiting: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.anxiety IS
    'Anxiety level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_withdrawal.agitation IS
    'Agitation level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_withdrawal.seizure_history IS
    'Whether the patient has a history of withdrawal seizures: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.delirium_tremens_history IS
    'Whether the patient has a history of delirium tremens: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.hallucinations IS
    'Whether the patient is experiencing hallucinations: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.last_drink_drug_hours IS
    'Hours since last drink or drug use.';
COMMENT ON COLUMN assessment_withdrawal.withdrawal_severity IS
    'Overall withdrawal severity: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_withdrawal.medically_supervised_detox_needed IS
    'Whether medically supervised detoxification is recommended: yes, no, or empty.';
COMMENT ON COLUMN assessment_withdrawal.withdrawal_notes IS
    'Additional clinician notes on withdrawal assessment.';
