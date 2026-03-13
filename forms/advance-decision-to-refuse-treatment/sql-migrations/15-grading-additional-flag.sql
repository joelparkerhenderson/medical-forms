-- 15_grading_additional_flag.sql
-- Additional flags detected during advance decision validity grading.

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
    'Additional flags detected during advance decision validity grading (e.g. LPA conflicts, missing witnesses, outdated review).';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Identifier of the flag (e.g. FLAG-LPA-001, FLAG-WIT-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Category of the flag (e.g. LPA Conflict, Missing Witness, Capacity Concern).';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable description of the flagged issue.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Priority level: high, medium, or low.';
