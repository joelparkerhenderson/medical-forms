-- ============================================================
-- 06_assessment_renal.sql
-- Renal subsection (1:1 with assessment).
-- ============================================================
-- Maps directly from the Renal TypeScript interface.
-- ============================================================

CREATE TABLE assessment_renal (
    -- Primary key
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id   UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Chronic kidney disease
    ckd             TEXT NOT NULL DEFAULT ''
                    CHECK (ckd IN ('yes', 'no', '')),
    ckd_stage       TEXT NOT NULL DEFAULT ''
                    CHECK (ckd_stage IN ('1', '2', '3', '4', '5', '')),

    -- Dialysis
    dialysis        TEXT NOT NULL DEFAULT ''
                    CHECK (dialysis IN ('yes', 'no', '')),
    dialysis_type   TEXT NOT NULL DEFAULT ''
                    CHECK (dialysis_type IN ('haemodialysis', 'peritoneal', '')),

    -- Ensure dependent fields are only set when parent condition is 'yes'
    CHECK (ckd = 'yes' OR ckd_stage = ''),
    CHECK (dialysis = 'yes' OR dialysis_type = ''),

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_renal_updated_at
    BEFORE UPDATE ON assessment_renal
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_renal IS
    '1:1 with assessment. Renal system questionnaire answers.';
COMMENT ON COLUMN assessment_renal.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_renal.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_renal.ckd IS
    'Does the patient have chronic kidney disease? yes/no/empty.';
COMMENT ON COLUMN assessment_renal.ckd_stage IS
    'CKD stage 1-5 or empty. Relevant only when ckd = yes.';
COMMENT ON COLUMN assessment_renal.dialysis IS
    'Is the patient on dialysis? yes/no/empty.';
COMMENT ON COLUMN assessment_renal.dialysis_type IS
    'Dialysis modality: haemodialysis, peritoneal, or empty.';
COMMENT ON COLUMN assessment_renal.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_renal.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
