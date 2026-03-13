-- ============================================================
-- 07_assessment_cardiovascular_risk.sql
-- Cardiovascular risk section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_cardiovascular_risk (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    systolic_bp             INTEGER CHECK (systolic_bp IS NULL OR (systolic_bp >= 60 AND systolic_bp <= 300)),
    diastolic_bp            INTEGER CHECK (diastolic_bp IS NULL OR (diastolic_bp >= 30 AND diastolic_bp <= 200)),
    on_antihypertensive     TEXT NOT NULL DEFAULT ''
                            CHECK (on_antihypertensive IN ('yes', 'no', '')),
    total_cholesterol       NUMERIC(4,1) CHECK (total_cholesterol IS NULL OR total_cholesterol >= 0),
    ldl_cholesterol         NUMERIC(4,1) CHECK (ldl_cholesterol IS NULL OR ldl_cholesterol >= 0),
    on_statin               TEXT NOT NULL DEFAULT ''
                            CHECK (on_statin IN ('yes', 'no', 'intolerant', '')),
    smoking_status          TEXT NOT NULL DEFAULT ''
                            CHECK (smoking_status IN ('never', 'exSmoker', 'currentSmoker', '')),
    previous_cvd_event      TEXT NOT NULL DEFAULT ''
                            CHECK (previous_cvd_event IN ('yes', 'no', '')),
    qrisk_score             NUMERIC(5,1) CHECK (qrisk_score IS NULL OR (qrisk_score >= 0 AND qrisk_score <= 100)),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_cardiovascular_risk_updated_at
    BEFORE UPDATE ON assessment_cardiovascular_risk
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiovascular_risk IS
    '1:1 with assessment. Cardiovascular risk factors and management.';
COMMENT ON COLUMN assessment_cardiovascular_risk.systolic_bp IS
    'Systolic blood pressure in mmHg. NULL if not recorded.';
COMMENT ON COLUMN assessment_cardiovascular_risk.diastolic_bp IS
    'Diastolic blood pressure in mmHg. NULL if not recorded.';
COMMENT ON COLUMN assessment_cardiovascular_risk.on_statin IS
    'Statin status: yes, no, intolerant, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.previous_cvd_event IS
    'History of cardiovascular disease event: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cardiovascular_risk.qrisk_score IS
    'QRISK3 cardiovascular risk score as percentage. NULL if not calculated.';
