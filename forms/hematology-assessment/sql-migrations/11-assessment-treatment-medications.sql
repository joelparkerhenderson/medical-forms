-- ============================================================
-- 11_assessment_treatment_medications.sql
-- Step 9: Treatment & Medications (1:1 with assessment).
-- ============================================================
-- Current treatment plan including medications, chemotherapy,
-- anticoagulant therapy, iron therapy, response, and effects.
-- ============================================================

CREATE TABLE assessment_treatment_medications (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Treatment & medication fields
    current_medications     TEXT NOT NULL DEFAULT '',
    chemotherapy_regimen    TEXT NOT NULL DEFAULT '',
    anticoagulant_therapy   TEXT NOT NULL DEFAULT '',
    iron_therapy            TEXT NOT NULL DEFAULT '',
    treatment_response      TEXT NOT NULL DEFAULT '',
    adverse_effects         TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_treatment_medications_updated_at
    BEFORE UPDATE ON assessment_treatment_medications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_treatment_medications IS
    '1:1 with assessment. Step 9: Treatment & Medications - current treatment plan and medication details.';
COMMENT ON COLUMN assessment_treatment_medications.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_treatment_medications.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_treatment_medications.current_medications IS
    'List of current medications. Empty string if unanswered.';
COMMENT ON COLUMN assessment_treatment_medications.chemotherapy_regimen IS
    'Chemotherapy regimen details. Empty string if unanswered.';
COMMENT ON COLUMN assessment_treatment_medications.anticoagulant_therapy IS
    'Anticoagulant therapy details. Empty string if unanswered.';
COMMENT ON COLUMN assessment_treatment_medications.iron_therapy IS
    'Iron therapy details (oral/IV). Empty string if unanswered.';
COMMENT ON COLUMN assessment_treatment_medications.treatment_response IS
    'Treatment response assessment. Empty string if unanswered.';
COMMENT ON COLUMN assessment_treatment_medications.adverse_effects IS
    'Adverse effects noted. Empty string if unanswered.';
COMMENT ON COLUMN assessment_treatment_medications.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_treatment_medications.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
