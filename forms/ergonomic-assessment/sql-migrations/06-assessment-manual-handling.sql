-- ============================================================
-- 06_assessment_manual_handling.sql
-- Manual handling evaluation (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_manual_handling (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    lifting_frequency           TEXT NOT NULL DEFAULT ''
                                CHECK (lifting_frequency IN ('none', 'occasional', 'frequent', 'constant', '')),
    load_weight_kg              NUMERIC(5,1) CHECK (load_weight_kg IS NULL OR (load_weight_kg >= 0 AND load_weight_kg <= 200)),
    carry_distance_metres       NUMERIC(5,1) CHECK (carry_distance_metres IS NULL OR (carry_distance_metres >= 0 AND carry_distance_metres <= 500)),
    push_pull_forces            TEXT NOT NULL DEFAULT ''
                                CHECK (push_pull_forces IN ('none', 'light', 'moderate', 'heavy', '')),
    team_lifting                TEXT NOT NULL DEFAULT ''
                                CHECK (team_lifting IN ('yes', 'no', '')),
    mechanical_aids_available   TEXT NOT NULL DEFAULT ''
                                CHECK (mechanical_aids_available IN ('yes', 'no', '')),

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_manual_handling_updated_at
    BEFORE UPDATE ON assessment_manual_handling
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_manual_handling IS
    'Manual handling evaluation: lifting frequency, load weight, carry distance, push/pull forces, team lifting, mechanical aids.';
COMMENT ON COLUMN assessment_manual_handling.lifting_frequency IS
    'How often objects are lifted: none, occasional, frequent, constant, or empty.';
COMMENT ON COLUMN assessment_manual_handling.load_weight_kg IS
    'Typical load weight in kilograms. NULL if not applicable.';
COMMENT ON COLUMN assessment_manual_handling.carry_distance_metres IS
    'Typical carrying distance in metres. NULL if not applicable.';
COMMENT ON COLUMN assessment_manual_handling.push_pull_forces IS
    'Push/pull force level: none, light, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_manual_handling.team_lifting IS
    'Whether team lifting is available: yes, no, or empty.';
COMMENT ON COLUMN assessment_manual_handling.mechanical_aids_available IS
    'Whether mechanical aids are available: yes, no, or empty.';
