-- ============================================================
-- 11_assessment_review_calculate.sql
-- Step 10: Review & Calculate (1:1 with assessment).
-- ============================================================
-- Clinician review metadata: model type selection, clinician
-- identity, and clinical notes captured at submission time.
-- ============================================================

CREATE TABLE assessment_review_calculate (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Model type selection
    model_type          TEXT NOT NULL DEFAULT ''
                        CHECK (model_type IN ('base', 'uacr', 'hba1c', 'full', '')),

    -- Clinician identity
    clinician_name      TEXT NOT NULL DEFAULT '',
    review_date         TEXT NOT NULL DEFAULT '',

    -- Clinical notes
    clinical_notes      TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_review_calculate_updated_at
    BEFORE UPDATE ON assessment_review_calculate
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_review_calculate IS
    '1:1 with assessment. Step 10: Model selection, clinician review metadata, and clinical notes.';
COMMENT ON COLUMN assessment_review_calculate.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_review_calculate.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_review_calculate.model_type IS
    'PREVENT model type: base, uacr (with uACR enhancement), hba1c (with HbA1c enhancement), full (all enhancements), or empty string if unanswered.';
COMMENT ON COLUMN assessment_review_calculate.clinician_name IS
    'Name of reviewing clinician. Empty string if unanswered.';
COMMENT ON COLUMN assessment_review_calculate.review_date IS
    'Date of clinician review as text (ISO 8601 date). Empty string if unanswered.';
COMMENT ON COLUMN assessment_review_calculate.clinical_notes IS
    'Free-text clinical observations or context notes. Empty string if unanswered.';
COMMENT ON COLUMN assessment_review_calculate.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_review_calculate.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
