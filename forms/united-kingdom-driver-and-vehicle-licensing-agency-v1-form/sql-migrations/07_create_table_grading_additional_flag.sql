CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_additional_flag_updated_at
    BEFORE UPDATE ON grading_additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE UNIQUE INDEX idx_grading_additional_flag_unique
    ON grading_additional_flag (grading_result_id, flag_id);

COMMENT ON TABLE grading_additional_flag IS 'Safety-critical clinical flags raised alongside the grading result.';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS 'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS 'Stable identifier of the flag.';
COMMENT ON COLUMN grading_additional_flag.category IS 'Category / domain of the flag.';
COMMENT ON COLUMN grading_additional_flag.description IS 'Human-readable description of the flag.';
COMMENT ON COLUMN grading_additional_flag.priority IS 'Priority: low, medium, high, critical.';

COMMENT ON COLUMN grading_additional_flag.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_additional_flag.updated_at IS
    'Timestamp when this row was last updated.';
