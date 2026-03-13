-- 07_assessment_cardiovascular_risk.sql
-- Cardiovascular risk section of the semaglutide assessment.

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
    resting_heart_rate_bpm INTEGER
        CHECK (resting_heart_rate_bpm IS NULL OR (resting_heart_rate_bpm >= 20 AND resting_heart_rate_bpm <= 250)),
    history_of_mi VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_mi IN ('yes', 'no', '')),
    history_of_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_stroke IN ('yes', 'no', '')),
    peripheral_arterial_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (peripheral_arterial_disease IN ('yes', 'no', '')),
    heart_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heart_failure IN ('yes', 'no', '')),
    heart_failure_nyha_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heart_failure_nyha_class IN ('I', 'II', 'III', 'IV', '')),
    atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (atrial_fibrillation IN ('yes', 'no', '')),
    family_history_cvd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cvd IN ('yes', 'no', '')),
    family_history_cvd_details TEXT NOT NULL DEFAULT '',
    obstructive_sleep_apnoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obstructive_sleep_apnoea IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiovascular_risk_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_risk
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_risk IS
    'Cardiovascular risk section: blood pressure, cardiac history, and vascular risk factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiovascular_risk.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiovascular_risk.hypertension IS
    'Whether patient has hypertension.';
COMMENT ON COLUMN assessment_cardiovascular_risk.systolic_bp_mmhg IS
    'Systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_cardiovascular_risk.diastolic_bp_mmhg IS
    'Diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_cardiovascular_risk.resting_heart_rate_bpm IS
    'Resting heart rate in beats per minute.';
COMMENT ON COLUMN assessment_cardiovascular_risk.history_of_mi IS
    'Whether patient has a history of myocardial infarction.';
COMMENT ON COLUMN assessment_cardiovascular_risk.history_of_stroke IS
    'Whether patient has a history of stroke.';
COMMENT ON COLUMN assessment_cardiovascular_risk.peripheral_arterial_disease IS
    'Whether patient has peripheral arterial disease.';
COMMENT ON COLUMN assessment_cardiovascular_risk.heart_failure IS
    'Whether patient has heart failure.';
COMMENT ON COLUMN assessment_cardiovascular_risk.heart_failure_nyha_class IS
    'NYHA functional classification of heart failure: I, II, III, IV, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.atrial_fibrillation IS
    'Whether patient has atrial fibrillation.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_cvd IS
    'Whether there is a family history of cardiovascular disease.';
COMMENT ON COLUMN assessment_cardiovascular_risk.family_history_cvd_details IS
    'Details of family cardiovascular disease history.';
COMMENT ON COLUMN assessment_cardiovascular_risk.obstructive_sleep_apnoea IS
    'Whether patient has obstructive sleep apnoea (weight-related comorbidity).';
