-- 08_assessment_cardiovascular_risk.sql
-- Cardiovascular risk section of the HRT assessment.

CREATE TABLE assessment_cardiovascular_risk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hypertension IN ('yes', 'no', '')),
    systolic_bp_mmhg INTEGER
        CHECK (systolic_bp_mmhg IS NULL OR (systolic_bp_mmhg >= 60 AND systolic_bp_mmhg <= 300)),
    diastolic_bp_mmhg INTEGER
        CHECK (diastolic_bp_mmhg IS NULL OR (diastolic_bp_mmhg >= 30 AND diastolic_bp_mmhg <= 200)),
    on_antihypertensive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antihypertensive IN ('yes', 'no', '')),
    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type-1', 'type-2', '')),
    hba1c NUMERIC(4,1),
    total_cholesterol NUMERIC(4,1),
    hdl_cholesterol NUMERIC(4,1),
    ldl_cholesterol NUMERIC(4,1),
    triglycerides NUMERIC(4,1),
    on_statin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_statin IN ('yes', 'no', '')),
    history_of_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_vte IN ('yes', 'no', '')),
    vte_details TEXT NOT NULL DEFAULT '',
    history_of_stroke_tia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_stroke_tia IN ('yes', 'no', '')),
    history_of_mi VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_mi IN ('yes', 'no', '')),
    family_history_cvd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cvd IN ('yes', 'no', '')),
    qrisk3_score NUMERIC(5,1),
    cardiovascular_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_risk_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_risk
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_risk IS
    'Cardiovascular risk section: blood pressure, lipids, VTE history, and QRISK3 score. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_risk.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiovascular_risk.has_hypertension IS
    'Whether the patient has hypertension: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.systolic_bp_mmhg IS
    'Systolic blood pressure in mmHg, NULL if unanswered.';
COMMENT ON COLUMN assessment_cardiovascular_risk.diastolic_bp_mmhg IS
    'Diastolic blood pressure in mmHg, NULL if unanswered.';
COMMENT ON COLUMN assessment_cardiovascular_risk.on_antihypertensive IS
    'Whether the patient is on antihypertensive medication: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.has_diabetes IS
    'Whether the patient has diabetes: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.diabetes_type IS
    'Diabetes type: type-1, type-2, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.hba1c IS
    'HbA1c in mmol/mol, NULL if not tested.';
COMMENT ON COLUMN assessment_cardiovascular_risk.total_cholesterol IS
    'Total cholesterol in mmol/L, NULL if not tested.';
COMMENT ON COLUMN assessment_cardiovascular_risk.hdl_cholesterol IS
    'HDL cholesterol in mmol/L, NULL if not tested.';
COMMENT ON COLUMN assessment_cardiovascular_risk.ldl_cholesterol IS
    'LDL cholesterol in mmol/L, NULL if not tested.';
COMMENT ON COLUMN assessment_cardiovascular_risk.triglycerides IS
    'Triglycerides in mmol/L, NULL if not tested.';
COMMENT ON COLUMN assessment_cardiovascular_risk.on_statin IS
    'Whether the patient is on statin therapy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.history_of_vte IS
    'Whether there is a personal history of VTE (DVT or PE): yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.vte_details IS
    'Details of VTE history.';
COMMENT ON COLUMN assessment_cardiovascular_risk.history_of_stroke_tia IS
    'Whether there is a history of stroke or TIA: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.history_of_mi IS
    'Whether there is a history of myocardial infarction: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_cvd IS
    'Whether there is a family history of cardiovascular disease: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.qrisk3_score IS
    'QRISK3 10-year cardiovascular risk percentage, NULL if not calculated.';
COMMENT ON COLUMN assessment_cardiovascular_risk.cardiovascular_notes IS
    'Free-text notes on cardiovascular risk.';
