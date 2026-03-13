-- 07_assessment_renal_function.sql
-- Renal function section of the assessment.

CREATE TABLE assessment_renal_function (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    egfr INTEGER
        CHECK (egfr IS NULL OR (egfr >= 0 AND egfr <= 200)),
    creatinine INTEGER
        CHECK (creatinine IS NULL OR (creatinine >= 0 AND creatinine <= 2000)),
    urine_acr NUMERIC(6,1)
        CHECK (urine_acr IS NULL OR (urine_acr >= 0 AND urine_acr <= 500)),
    proteinuria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (proteinuria IN ('yes', 'no', '')),
    ckd_stage VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (ckd_stage IN ('none', '1', '2', '3a', '3b', '4', '5', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_renal_function_updated_at
    BEFORE UPDATE ON assessment_renal_function
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_renal_function IS
    'Renal function section: kidney function tests and CKD staging. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_renal_function.egfr IS
    'Estimated glomerular filtration rate in mL/min/1.73m².';
COMMENT ON COLUMN assessment_renal_function.creatinine IS
    'Serum creatinine in µmol/L.';
COMMENT ON COLUMN assessment_renal_function.urine_acr IS
    'Urine albumin-creatinine ratio in mg/mmol.';
COMMENT ON COLUMN assessment_renal_function.ckd_stage IS
    'Chronic kidney disease stage: none, 1, 2, 3a, 3b, 4, or 5.';
