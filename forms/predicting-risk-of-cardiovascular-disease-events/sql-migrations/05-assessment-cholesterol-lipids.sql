-- ============================================================
-- 05_assessment_cholesterol_lipids.sql
-- Step 4: Cholesterol & Lipids (1:1 with assessment).
-- ============================================================
-- Lipid panel values and statin treatment status.
-- Total cholesterol and HDL are primary PREVENT model inputs.
-- ============================================================

CREATE TABLE assessment_cholesterol_lipids (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Lipid panel values (mg/dL)
    total_cholesterol       NUMERIC(6,1) CHECK (total_cholesterol IS NULL OR (total_cholesterol >= 50 AND total_cholesterol <= 500)),
    hdl_cholesterol         NUMERIC(5,1) CHECK (hdl_cholesterol IS NULL OR (hdl_cholesterol >= 10 AND hdl_cholesterol <= 200)),
    ldl_cholesterol         NUMERIC(5,1) CHECK (ldl_cholesterol IS NULL OR (ldl_cholesterol >= 10 AND ldl_cholesterol <= 400)),
    triglycerides           NUMERIC(6,1) CHECK (triglycerides IS NULL OR (triglycerides >= 10 AND triglycerides <= 1000)),
    non_hdl_cholesterol     NUMERIC(5,1) CHECK (non_hdl_cholesterol IS NULL OR (non_hdl_cholesterol >= 10 AND non_hdl_cholesterol <= 500)),

    -- Statin treatment
    on_statin               TEXT NOT NULL DEFAULT ''
                            CHECK (on_statin IN ('yes', 'no', '')),
    statin_name             TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_cholesterol_lipids_updated_at
    BEFORE UPDATE ON assessment_cholesterol_lipids
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cholesterol_lipids IS
    '1:1 with assessment. Step 4: Lipid panel values and statin treatment status.';
COMMENT ON COLUMN assessment_cholesterol_lipids.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_cholesterol_lipids.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_cholesterol_lipids.total_cholesterol IS
    'Total cholesterol in mg/dL. NULL if not recorded. Primary PREVENT model input.';
COMMENT ON COLUMN assessment_cholesterol_lipids.hdl_cholesterol IS
    'HDL cholesterol in mg/dL. NULL if not recorded. Primary PREVENT model input (inverse relationship).';
COMMENT ON COLUMN assessment_cholesterol_lipids.ldl_cholesterol IS
    'LDL cholesterol in mg/dL. NULL if not recorded.';
COMMENT ON COLUMN assessment_cholesterol_lipids.triglycerides IS
    'Triglycerides in mg/dL. NULL if not recorded.';
COMMENT ON COLUMN assessment_cholesterol_lipids.non_hdl_cholesterol IS
    'Non-HDL cholesterol in mg/dL. NULL if not recorded.';
COMMENT ON COLUMN assessment_cholesterol_lipids.on_statin IS
    'Whether patient is on statin therapy: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_cholesterol_lipids.statin_name IS
    'Name of statin medication if on statin therapy. Empty string if unanswered.';
COMMENT ON COLUMN assessment_cholesterol_lipids.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_cholesterol_lipids.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
