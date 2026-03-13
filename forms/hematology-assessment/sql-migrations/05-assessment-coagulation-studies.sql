-- ============================================================
-- 05_assessment_coagulation_studies.sql
-- Step 3: Coagulation Studies (1:1 with assessment).
-- ============================================================
-- Coagulation profile including PT, INR, aPTT, fibrinogen,
-- D-dimer, and bleeding time.
-- ============================================================

CREATE TABLE assessment_coagulation_studies (
    -- Primary key
    id                                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id                       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Coagulation fields
    prothrombin_time                    NUMERIC(5,1) CHECK (prothrombin_time IS NULL OR (prothrombin_time >= 0 AND prothrombin_time <= 120)),
    inr                                 NUMERIC(4,1) CHECK (inr IS NULL OR (inr >= 0 AND inr <= 20)),
    activated_partial_thromboplastin_time NUMERIC(5,1) CHECK (activated_partial_thromboplastin_time IS NULL OR (activated_partial_thromboplastin_time >= 0 AND activated_partial_thromboplastin_time <= 200)),
    fibrinogen                          NUMERIC(6,1) CHECK (fibrinogen IS NULL OR (fibrinogen >= 0 AND fibrinogen <= 2000)),
    d_dimer                             NUMERIC(6,2) CHECK (d_dimer IS NULL OR (d_dimer >= 0 AND d_dimer <= 100)),
    bleeding_time                       NUMERIC(5,1) CHECK (bleeding_time IS NULL OR (bleeding_time >= 0 AND bleeding_time <= 60)),

    -- Audit timestamps
    created_at                          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_coagulation_studies_updated_at
    BEFORE UPDATE ON assessment_coagulation_studies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_coagulation_studies IS
    '1:1 with assessment. Step 3: Coagulation Studies - PT, INR, aPTT, fibrinogen, D-dimer, bleeding time.';
COMMENT ON COLUMN assessment_coagulation_studies.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_coagulation_studies.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_coagulation_studies.prothrombin_time IS
    'Prothrombin time in seconds. Normal: 11-13.5s. NULL if unanswered.';
COMMENT ON COLUMN assessment_coagulation_studies.inr IS
    'International normalised ratio. Normal: 0.8-1.2. NULL if unanswered.';
COMMENT ON COLUMN assessment_coagulation_studies.activated_partial_thromboplastin_time IS
    'Activated partial thromboplastin time in seconds. Normal: 25-35s. NULL if unanswered.';
COMMENT ON COLUMN assessment_coagulation_studies.fibrinogen IS
    'Fibrinogen level in mg/dL. Normal: 200-400 mg/dL. NULL if unanswered.';
COMMENT ON COLUMN assessment_coagulation_studies.d_dimer IS
    'D-dimer level in mg/L. Normal: <0.5 mg/L. NULL if unanswered.';
COMMENT ON COLUMN assessment_coagulation_studies.bleeding_time IS
    'Bleeding time in minutes. Normal: 2-9 minutes. NULL if unanswered.';
COMMENT ON COLUMN assessment_coagulation_studies.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_coagulation_studies.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
