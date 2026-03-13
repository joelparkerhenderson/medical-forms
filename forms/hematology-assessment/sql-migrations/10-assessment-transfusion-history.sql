-- ============================================================
-- 10_assessment_transfusion_history.sql
-- Step 8: Transfusion History (1:1 with assessment).
-- ============================================================
-- Blood transfusion history including previous transfusions,
-- reactions, blood group, antibody screen, and crossmatch.
-- ============================================================

CREATE TABLE assessment_transfusion_history (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Transfusion history fields
    previous_transfusions   TEXT NOT NULL DEFAULT '',
    transfusion_reactions   TEXT NOT NULL DEFAULT '',
    blood_group_type        TEXT NOT NULL DEFAULT '',
    antibody_screen         TEXT NOT NULL DEFAULT '',
    crossmatch_results      TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_transfusion_history_updated_at
    BEFORE UPDATE ON assessment_transfusion_history
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_transfusion_history IS
    '1:1 with assessment. Step 8: Transfusion History - previous transfusions, reactions, blood group, antibody screen.';
COMMENT ON COLUMN assessment_transfusion_history.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_transfusion_history.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_transfusion_history.previous_transfusions IS
    'Description of previous transfusions. Empty string if unanswered.';
COMMENT ON COLUMN assessment_transfusion_history.transfusion_reactions IS
    'Description of any transfusion reactions. Empty string if unanswered.';
COMMENT ON COLUMN assessment_transfusion_history.blood_group_type IS
    'Blood group and type (e.g. A+, O-). Empty string if unanswered.';
COMMENT ON COLUMN assessment_transfusion_history.antibody_screen IS
    'Antibody screen results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_transfusion_history.crossmatch_results IS
    'Crossmatch results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_transfusion_history.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_transfusion_history.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
