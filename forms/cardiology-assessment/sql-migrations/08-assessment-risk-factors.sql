-- 08_assessment_risk_factors.sql
-- Cardiovascular risk factors section of the cardiology assessment.

CREATE TABLE assessment_risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    systolic_bp_mmhg INTEGER
        CHECK (systolic_bp_mmhg IS NULL OR (systolic_bp_mmhg >= 50 AND systolic_bp_mmhg <= 300)),
    diastolic_bp_mmhg INTEGER
        CHECK (diastolic_bp_mmhg IS NULL OR (diastolic_bp_mmhg >= 20 AND diastolic_bp_mmhg <= 200)),
    diabetes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('type-1', 'type-2', 'no', '')),
    hba1c_mmol_mol NUMERIC(5,1)
        CHECK (hba1c_mmol_mol IS NULL OR (hba1c_mmol_mol >= 0 AND hba1c_mmol_mol <= 200)),
    hyperlipidaemia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hyperlipidaemia IN ('yes', 'no', '')),
    total_cholesterol_mmol NUMERIC(4,1)
        CHECK (total_cholesterol_mmol IS NULL OR (total_cholesterol_mmol >= 0 AND total_cholesterol_mmol <= 20)),
    ldl_cholesterol_mmol NUMERIC(4,1)
        CHECK (ldl_cholesterol_mmol IS NULL OR (ldl_cholesterol_mmol >= 0 AND ldl_cholesterol_mmol <= 15)),
    hdl_cholesterol_mmol NUMERIC(4,1)
        CHECK (hdl_cholesterol_mmol IS NULL OR (hdl_cholesterol_mmol >= 0 AND hdl_cholesterol_mmol <= 10)),
    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'ex-smoker', 'never', '')),
    pack_years NUMERIC(5,1),
    family_history_cvd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cvd IN ('yes', 'no', '')),
    family_cvd_details TEXT NOT NULL DEFAULT '',
    obesity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (obesity IN ('yes', 'no', '')),
    chronic_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_kidney_disease IN ('yes', 'no', '')),
    ckd_stage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ckd_stage IN ('1', '2', '3a', '3b', '4', '5', '')),
    risk_factors_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risk_factors_updated_at
    BEFORE UPDATE ON assessment_risk_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risk_factors IS
    'Cardiovascular risk factors section: hypertension, diabetes, lipids, smoking, family history, and CKD. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risk_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_risk_factors.hypertension IS
    'Whether the patient has hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_factors.systolic_bp_mmhg IS
    'Most recent systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_risk_factors.diastolic_bp_mmhg IS
    'Most recent diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_risk_factors.diabetes IS
    'Diabetes status: type-1, type-2, no, or empty.';
COMMENT ON COLUMN assessment_risk_factors.hba1c_mmol_mol IS
    'Most recent HbA1c level in mmol/mol.';
COMMENT ON COLUMN assessment_risk_factors.hyperlipidaemia IS
    'Whether the patient has hyperlipidaemia: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_factors.total_cholesterol_mmol IS
    'Total cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_risk_factors.ldl_cholesterol_mmol IS
    'LDL cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_risk_factors.hdl_cholesterol_mmol IS
    'HDL cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_risk_factors.smoking_status IS
    'Smoking status: current, ex-smoker, never, or empty.';
COMMENT ON COLUMN assessment_risk_factors.pack_years IS
    'Smoking history in pack-years.';
COMMENT ON COLUMN assessment_risk_factors.family_history_cvd IS
    'Whether there is a family history of premature cardiovascular disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_factors.family_cvd_details IS
    'Details of family cardiovascular disease history.';
COMMENT ON COLUMN assessment_risk_factors.obesity IS
    'Whether the patient is obese (BMI >= 30): yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_factors.chronic_kidney_disease IS
    'Whether the patient has chronic kidney disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_factors.ckd_stage IS
    'CKD stage: 1, 2, 3a, 3b, 4, 5, or empty.';
COMMENT ON COLUMN assessment_risk_factors.risk_factors_notes IS
    'Additional clinician notes on cardiovascular risk factors.';
