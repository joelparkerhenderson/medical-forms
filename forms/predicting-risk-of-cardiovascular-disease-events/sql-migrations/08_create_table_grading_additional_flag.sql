CREATE TABLE grading_additional_flag (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: one grading result can have many flags
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,

    -- Flag identification (matches the application-side flag id)
    flag_id             TEXT NOT NULL,

    -- Flag details
    category            TEXT NOT NULL,
    message             TEXT NOT NULL,
    priority            TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all flags for a grading result
CREATE INDEX idx_grading_additional_flag_grading_result_id
    ON grading_additional_flag(grading_result_id);

-- Prevent duplicate flags per grading result
CREATE UNIQUE INDEX idx_grading_additional_flag_unique
    ON grading_additional_flag(grading_result_id, flag_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_additional_flag IS
    'Many-to-one with grading_result. Safety-critical alerts detected by the flagged issues engine.';
COMMENT ON COLUMN grading_additional_flag.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'FK to grading_result. One result may have many flags.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Application-side flag identifier (e.g. FLAG-CVD-001, FLAG-BP-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Flag category (e.g. Eligibility, Blood Pressure, Cholesterol, Diabetes, Renal Function).';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable alert message for the clinician.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Alert priority: high, medium, or low.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_additional_flag.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
