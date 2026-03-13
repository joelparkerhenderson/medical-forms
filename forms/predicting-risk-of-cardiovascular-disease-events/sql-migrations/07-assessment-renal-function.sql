-- ============================================================
-- 07_assessment_renal_function.sql
-- Step 6: Renal Function (1:1 with assessment).
-- ============================================================
-- Kidney function markers. eGFR is a primary input to the
-- PREVENT risk model. uACR is used in the enhanced model.
-- ============================================================

CREATE TABLE assessment_renal_function (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Renal function markers
    egfr                NUMERIC(5,1) CHECK (egfr IS NULL OR (egfr >= 1 AND egfr <= 200)),
    creatinine          NUMERIC(5,1) CHECK (creatinine IS NULL OR (creatinine >= 0.1 AND creatinine <= 30)),
    urine_acr           NUMERIC(7,1) CHECK (urine_acr IS NULL OR (urine_acr >= 0 AND urine_acr <= 5000)),

    -- CKD staging
    ckd_stage           TEXT NOT NULL DEFAULT ''
                        CHECK (ckd_stage IN ('1', '2', '3a', '3b', '4', '5', '')),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_renal_function_updated_at
    BEFORE UPDATE ON assessment_renal_function
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_renal_function IS
    '1:1 with assessment. Step 6: Kidney function markers for PREVENT risk estimation.';
COMMENT ON COLUMN assessment_renal_function.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_renal_function.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_renal_function.egfr IS
    'Estimated glomerular filtration rate in mL/min/1.73m2. NULL if not recorded. Primary PREVENT input.';
COMMENT ON COLUMN assessment_renal_function.creatinine IS
    'Serum creatinine in mg/dL. NULL if not recorded.';
COMMENT ON COLUMN assessment_renal_function.urine_acr IS
    'Urine albumin-to-creatinine ratio in mg/g. NULL if not recorded. Used in PREVENT uACR-enhanced model.';
COMMENT ON COLUMN assessment_renal_function.ckd_stage IS
    'Chronic Kidney Disease stage: 1, 2, 3a, 3b, 4, 5, or empty string if unanswered.';
COMMENT ON COLUMN assessment_renal_function.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_renal_function.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
