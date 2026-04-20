-- 07_assessment_cardiovascular_risk.sql
-- Cardiovascular risk factors section of the birth control assessment.

CREATE TABLE assessment_cardiovascular_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    systolic_bp_mmhg INTEGER
        CHECK (systolic_bp_mmhg IS NULL OR (systolic_bp_mmhg >= 50 AND systolic_bp_mmhg <= 300)),
    diastolic_bp_mmhg INTEGER
        CHECK (diastolic_bp_mmhg IS NULL OR (diastolic_bp_mmhg >= 20 AND diastolic_bp_mmhg <= 200)),
    bp_controlled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bp_controlled IN ('yes', 'no', '')),
    ischaemic_heart_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ischaemic_heart_disease IN ('yes', 'no', '')),
    stroke_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stroke_history IN ('yes', 'no', '')),
    valvular_heart_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (valvular_heart_disease IN ('yes', 'no', '')),
    valvular_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (valvular_complications IN ('yes', 'no', '')),
    hyperlipidaemia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hyperlipidaemia IN ('yes', 'no', '')),
    family_history_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_vte IN ('yes', 'no', '')),
    family_history_cvd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cvd IN ('yes', 'no', '')),
    family_cvd_details TEXT NOT NULL DEFAULT '',
    cardiovascular_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_risk_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_risk
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_risk IS
    'Cardiovascular risk factors section: blood pressure, heart disease, stroke, and family history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_risk.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiovascular_risk.hypertension IS
    'Whether the patient has hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.systolic_bp_mmhg IS
    'Most recent systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_cardiovascular_risk.diastolic_bp_mmhg IS
    'Most recent diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_cardiovascular_risk.bp_controlled IS
    'Whether blood pressure is well controlled: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.ischaemic_heart_disease IS
    'Whether the patient has ischaemic heart disease (UK MEC 4 for COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.stroke_history IS
    'Whether the patient has a history of stroke (UK MEC 4 for COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.valvular_heart_disease IS
    'Whether the patient has valvular heart disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.valvular_complications IS
    'Whether valvular disease has complications (pulmonary hypertension, AF, endocarditis): yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.hyperlipidaemia IS
    'Whether the patient has hyperlipidaemia: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_vte IS
    'Family history of venous thromboembolism (first degree relative): yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_cvd IS
    'Family history of premature cardiovascular disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_cvd_details IS
    'Details of family cardiovascular or VTE history.';
COMMENT ON COLUMN assessment_cardiovascular_risk.cardiovascular_notes IS
    'Additional clinician notes on cardiovascular risk factors.';
