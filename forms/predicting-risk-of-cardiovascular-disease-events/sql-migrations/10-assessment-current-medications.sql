-- ============================================================
-- 10_assessment_current_medications.sql
-- Step 9: Current Medications (1:1 with assessment).
-- ============================================================
-- Current cardiovascular and metabolic medications.
-- Medication status contributes to risk flags (e.g., high
-- risk without statin, diabetes without medication).
-- ============================================================

CREATE TABLE assessment_current_medications (
    -- Primary key
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id                   UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Medication status
    on_antihypertensive_detail      TEXT NOT NULL DEFAULT ''
                                    CHECK (on_antihypertensive_detail IN ('yes', 'no', '')),
    on_statin_detail                TEXT NOT NULL DEFAULT ''
                                    CHECK (on_statin_detail IN ('yes', 'no', '')),
    on_aspirin                      TEXT NOT NULL DEFAULT ''
                                    CHECK (on_aspirin IN ('yes', 'no', '')),
    on_anticoagulant                TEXT NOT NULL DEFAULT ''
                                    CHECK (on_anticoagulant IN ('yes', 'no', '')),
    on_diabetes_medication          TEXT NOT NULL DEFAULT ''
                                    CHECK (on_diabetes_medication IN ('yes', 'no', '')),

    -- Free text for additional medications
    other_medications               TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    '1:1 with assessment. Step 9: Current cardiovascular and metabolic medication status.';
COMMENT ON COLUMN assessment_current_medications.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_current_medications.on_antihypertensive_detail IS
    'On antihypertensive medication: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.on_statin_detail IS
    'On statin medication: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.on_aspirin IS
    'On aspirin: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.on_anticoagulant IS
    'On anticoagulant medication: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.on_diabetes_medication IS
    'On diabetes medication: yes, no, or empty string if unanswered. Absence may trigger FLAG-MED-002.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text listing of other current medications. Empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
