-- ============================================================
-- 09_assessment_current_interventions.sql
-- Current ergonomic interventions and treatments (1:1).
-- ============================================================

CREATE TABLE assessment_current_interventions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Ergonomic equipment stored as an array
    ergonomic_equipment     TEXT[] NOT NULL DEFAULT '{}',
    physiotherapy           TEXT NOT NULL DEFAULT ''
                            CHECK (physiotherapy IN ('yes', 'no', '')),
    occupational_therapy    TEXT NOT NULL DEFAULT ''
                            CHECK (occupational_therapy IN ('yes', 'no', '')),
    workplace_adjustments   TEXT NOT NULL DEFAULT '',
    medications             TEXT NOT NULL DEFAULT '',

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_current_interventions_updated_at
    BEFORE UPDATE ON assessment_current_interventions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_interventions IS
    'Current interventions: ergonomic equipment in use, therapies, workplace adjustments, medications.';
COMMENT ON COLUMN assessment_current_interventions.ergonomic_equipment IS
    'Array of ergonomic equipment identifiers currently in use (e.g. ergonomic-chair, standing-desk, wrist-rest).';
COMMENT ON COLUMN assessment_current_interventions.physiotherapy IS
    'Whether the patient is receiving physiotherapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_interventions.occupational_therapy IS
    'Whether the patient is receiving occupational therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_interventions.workplace_adjustments IS
    'Free-text description of current workplace adjustments.';
COMMENT ON COLUMN assessment_current_interventions.medications IS
    'Free-text description of current medications for the condition.';
