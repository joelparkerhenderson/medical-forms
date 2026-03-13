-- ============================================================
-- 20_grading_result.sql
-- Computed diabetes grading result (1:1 with assessment).
-- ============================================================
-- Stores the output of the diabetes grading engine. Created
-- when the assessment is submitted and the engine runs.
-- ============================================================

CREATE TABLE grading_result (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Computed control level
    control_level       TEXT NOT NULL
                        CHECK (control_level IN ('wellControlled', 'suboptimal', 'poor', 'veryPoor', 'draft')),

    -- Composite control score (0-100)
    control_score       INTEGER NOT NULL CHECK (control_score >= 0 AND control_score <= 100),

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
    '1:1 with assessment. Stores computed diabetes control level and composite score.';
COMMENT ON COLUMN grading_result.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN grading_result.control_level IS
    'Computed control level: wellControlled, suboptimal, poor, veryPoor, or draft.';
COMMENT ON COLUMN grading_result.control_score IS
    'Composite control score (0-100). Based on HbA1c, adherence, diet, time in range, complications.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading engine produced this result.';
COMMENT ON COLUMN grading_result.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
