-- 15_grading_additional_flag.sql
-- Additional safety-critical flags detected during MCAS assessment grading.

CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(30) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('high', 'medium', 'low')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_additional_flag IS
    'Additional safety-critical flags detected during MCAS assessment grading (e.g. anaphylaxis risk, elevated tryptase, multi-system involvement).';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Identifier of the flag (e.g. FLAG-ANAPH-001, FLAG-TRYPT-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Category of the flag (e.g. Anaphylaxis Risk, Laboratory, Multi-System).';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable message describing the flagged issue.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Priority level: high, medium, or low.';
