-- ============================================================
-- 09_assessment_bone_marrow_assessment.sql
-- Step 7: Bone Marrow Assessment (1:1 with assessment).
-- ============================================================
-- Bone marrow aspirate and biopsy findings including
-- cellularity, cytogenetics, and flow cytometry.
-- ============================================================

CREATE TABLE assessment_bone_marrow_assessment (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Bone marrow fields
    aspirate_findings           TEXT NOT NULL DEFAULT '',
    biopsy_findings             TEXT NOT NULL DEFAULT '',
    cellularity                 SMALLINT CHECK (cellularity IS NULL OR (cellularity >= 0 AND cellularity <= 100)),
    cytogenetics_results        TEXT NOT NULL DEFAULT '',
    flow_cytometry_results      TEXT NOT NULL DEFAULT '',
    bone_marrow_comments        TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_bone_marrow_assessment_updated_at
    BEFORE UPDATE ON assessment_bone_marrow_assessment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_bone_marrow_assessment IS
    '1:1 with assessment. Step 7: Bone Marrow Assessment - aspirate, biopsy, cellularity, cytogenetics, flow cytometry.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_bone_marrow_assessment.aspirate_findings IS
    'Bone marrow aspirate findings description. Empty string if unanswered.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.biopsy_findings IS
    'Bone marrow biopsy findings description. Empty string if unanswered.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.cellularity IS
    'Bone marrow cellularity percentage (0-100). NULL if not assessed.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.cytogenetics_results IS
    'Cytogenetics results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.flow_cytometry_results IS
    'Flow cytometry results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.bone_marrow_comments IS
    'Additional bone marrow comments. Empty string if unanswered.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_bone_marrow_assessment.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
