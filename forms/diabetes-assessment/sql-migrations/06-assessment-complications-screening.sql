-- ============================================================
-- 06_assessment_complications_screening.sql
-- Complications screening section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_complications_screening (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    retinopathy_status      TEXT NOT NULL DEFAULT ''
                            CHECK (retinopathy_status IN ('none', 'background', 'preProliferative', 'proliferative', 'maculopathy', '')),
    last_eye_screening      DATE,
    nephropathy_status      TEXT NOT NULL DEFAULT ''
                            CHECK (nephropathy_status IN ('normal', 'microalbuminuria', 'macroalbuminuria', 'ckd', '')),
    egfr                    NUMERIC(5,1) CHECK (egfr IS NULL OR egfr >= 0),
    urine_acr               NUMERIC(6,1) CHECK (urine_acr IS NULL OR urine_acr >= 0),
    neuropathy_symptoms     TEXT NOT NULL DEFAULT ''
                            CHECK (neuropathy_symptoms IN ('yes', 'no', '')),
    autonomic_neuropathy    TEXT NOT NULL DEFAULT ''
                            CHECK (autonomic_neuropathy IN ('none', 'suspected', 'confirmed', '')),
    erectile_dysfunction    TEXT NOT NULL DEFAULT ''
                            CHECK (erectile_dysfunction IN ('notApplicable', 'no', 'yes', '')),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_complications_screening_updated_at
    BEFORE UPDATE ON assessment_complications_screening
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_complications_screening IS
    '1:1 with assessment. Diabetes-related complications and screening results.';
COMMENT ON COLUMN assessment_complications_screening.retinopathy_status IS
    'Retinopathy stage: none, background, preProliferative, proliferative, maculopathy, or empty.';
COMMENT ON COLUMN assessment_complications_screening.last_eye_screening IS
    'Date of most recent eye screening. NULL if not recorded.';
COMMENT ON COLUMN assessment_complications_screening.egfr IS
    'Estimated glomerular filtration rate in mL/min/1.73m2. NULL if not recorded.';
COMMENT ON COLUMN assessment_complications_screening.urine_acr IS
    'Urine albumin-to-creatinine ratio in mg/mmol. NULL if not recorded.';
COMMENT ON COLUMN assessment_complications_screening.neuropathy_symptoms IS
    'Peripheral neuropathy symptoms present: yes, no, or empty string.';
