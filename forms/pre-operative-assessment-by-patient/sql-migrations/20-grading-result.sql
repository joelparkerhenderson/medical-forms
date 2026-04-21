-- ============================================================
-- 20_grading_result.sql
-- Computed ASA grading result (1:1 with assessment).
-- ============================================================
-- Stores the output of the ASA grading engine. Created when
-- the patient submits the questionnaire and the engine runs.
-- Supports clinician override with documented reason.
-- ============================================================

CREATE TABLE grading_result (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Computed ASA grade (highest grade from all fired rules; 1 if none fired)
    asa_grade           INTEGER NOT NULL CHECK (asa_grade BETWEEN 1 AND 5),

    -- Clinician override: when clinical judgement differs from computed grade
    asa_grade_override  INTEGER CHECK (asa_grade_override IS NULL OR asa_grade_override BETWEEN 1 AND 6),
    override_reason     TEXT NOT NULL DEFAULT ''
                        CHECK (asa_grade_override IS NULL OR override_reason != ''),

    -- Timestamp of when the grading engine ran
    graded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    '1:1 with assessment. Stores computed ASA grade and optional clinician override.';
COMMENT ON COLUMN grading_result.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN grading_result.asa_grade IS
    'Computed ASA grade (1-5). Determined by the highest-grade fired rule; defaults to 1 (healthy).';
COMMENT ON COLUMN grading_result.asa_grade_override IS
    'Clinician-assigned ASA grade override (1-6). NULL means no override. 6 = brain-dead donor.';
COMMENT ON COLUMN grading_result.override_reason IS
    'Free-text justification for overriding the computed grade. Required when override is set.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading engine produced this result.';
COMMENT ON COLUMN grading_result.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
