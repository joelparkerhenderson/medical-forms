-- 10-assessment-renal-hepatic.sql
-- Step 8: renal and hepatic function.

CREATE TABLE assessment_renal_hepatic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    creatinine_umol_l INTEGER,
    egfr_ml_min_1_73m2 INTEGER,
    urea_mmol_l NUMERIC(4,1),
    potassium_mmol_l NUMERIC(3,1),
    sodium_mmol_l NUMERIC(4,1),

    dialysis_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dialysis_status IN ('none', 'peritoneal', 'haemodialysis', 'haemofiltration', '')),
    ckd_stage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ckd_stage IN ('1', '2', '3a', '3b', '4', '5', '')),

    bilirubin_umol_l INTEGER,
    alt_u_l INTEGER,
    ast_u_l INTEGER,
    alp_u_l INTEGER,
    albumin_g_l NUMERIC(4,1),

    chronic_liver_disease VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (chronic_liver_disease IN ('none', 'compensated', 'decompensated', '')),
    child_pugh_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (child_pugh_class IN ('A', 'B', 'C', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_renal_hepatic_updated_at
    BEFORE UPDATE ON assessment_renal_hepatic
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_renal_hepatic IS
    'Step 8: renal and hepatic laboratory results and severity classification.';
COMMENT ON COLUMN assessment_renal_hepatic.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_renal_hepatic.creatinine_umol_l IS
    'Serum creatinine in micromoles per litre.';
COMMENT ON COLUMN assessment_renal_hepatic.egfr_ml_min_1_73m2 IS
    'Estimated glomerular filtration rate in mL/min/1.73 m^2.';
COMMENT ON COLUMN assessment_renal_hepatic.urea_mmol_l IS
    'Serum urea in mmol/L.';
COMMENT ON COLUMN assessment_renal_hepatic.potassium_mmol_l IS
    'Serum potassium in mmol/L.';
COMMENT ON COLUMN assessment_renal_hepatic.sodium_mmol_l IS
    'Serum sodium in mmol/L.';
COMMENT ON COLUMN assessment_renal_hepatic.dialysis_status IS
    'Dialysis status: none, peritoneal, haemodialysis, haemofiltration.';
COMMENT ON COLUMN assessment_renal_hepatic.ckd_stage IS
    'KDIGO chronic kidney disease stage: 1, 2, 3a, 3b, 4, 5.';
COMMENT ON COLUMN assessment_renal_hepatic.bilirubin_umol_l IS
    'Serum bilirubin in micromoles per litre.';
COMMENT ON COLUMN assessment_renal_hepatic.alt_u_l IS
    'Alanine aminotransferase in U/L.';
COMMENT ON COLUMN assessment_renal_hepatic.ast_u_l IS
    'Aspartate aminotransferase in U/L.';
COMMENT ON COLUMN assessment_renal_hepatic.alp_u_l IS
    'Alkaline phosphatase in U/L.';
COMMENT ON COLUMN assessment_renal_hepatic.albumin_g_l IS
    'Serum albumin in g/L.';
COMMENT ON COLUMN assessment_renal_hepatic.chronic_liver_disease IS
    'Chronic liver disease: none, compensated, decompensated.';
COMMENT ON COLUMN assessment_renal_hepatic.child_pugh_class IS
    'Child-Pugh class for cirrhosis severity: A, B, C.';
