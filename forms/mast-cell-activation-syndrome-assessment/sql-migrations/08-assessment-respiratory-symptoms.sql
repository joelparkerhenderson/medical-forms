-- 08_assessment_respiratory_symptoms.sql
-- Respiratory symptoms section of the MCAS assessment.

CREATE TABLE assessment_respiratory_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    wheezing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wheezing IN ('yes', 'no', '')),
    dyspnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dyspnoea IN ('yes', 'no', '')),
    dyspnoea_severity INTEGER
        CHECK (dyspnoea_severity IS NULL OR (dyspnoea_severity >= 0 AND dyspnoea_severity <= 10)),
    nasal_congestion VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nasal_congestion IN ('yes', 'no', '')),
    rhinorrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rhinorrhoea IN ('yes', 'no', '')),
    throat_tightness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (throat_tightness IN ('yes', 'no', '')),
    stridor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stridor IN ('yes', 'no', '')),
    cough VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cough IN ('yes', 'no', '')),
    cough_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cough_type IN ('dry', 'productive', '')),
    asthma_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asthma_diagnosis IN ('yes', 'no', '')),
    peak_flow_lpm INTEGER
        CHECK (peak_flow_lpm IS NULL OR (peak_flow_lpm >= 0 AND peak_flow_lpm <= 900)),
    respiratory_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_respiratory_symptoms_updated_at
    BEFORE UPDATE ON assessment_respiratory_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_respiratory_symptoms IS
    'Respiratory symptoms section: wheezing, dyspnoea, nasal symptoms, throat tightness, and asthma status. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_respiratory_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_respiratory_symptoms.wheezing IS
    'Whether the patient experiences wheezing: yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.dyspnoea IS
    'Whether the patient experiences dyspnoea (shortness of breath): yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.dyspnoea_severity IS
    'Dyspnoea severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_respiratory_symptoms.nasal_congestion IS
    'Whether the patient experiences nasal congestion: yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.rhinorrhoea IS
    'Whether the patient experiences rhinorrhoea (runny nose): yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.throat_tightness IS
    'Whether the patient experiences throat tightness: yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.stridor IS
    'Whether the patient has stridor (high-pitched breathing): yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.cough IS
    'Whether the patient has a cough: yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.cough_type IS
    'Type of cough: dry, productive, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.asthma_diagnosis IS
    'Whether the patient has a formal asthma diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_respiratory_symptoms.peak_flow_lpm IS
    'Peak expiratory flow rate in litres per minute, if measured.';
COMMENT ON COLUMN assessment_respiratory_symptoms.respiratory_notes IS
    'Free-text clinician notes on respiratory findings.';
