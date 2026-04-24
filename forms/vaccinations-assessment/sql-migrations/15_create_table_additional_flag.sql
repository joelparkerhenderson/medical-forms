CREATE TABLE additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    priority VARCHAR(10) NOT NULL DEFAULT 'low'
        CHECK (priority IN ('high', 'medium', 'low')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_additional_flag_updated_at
    BEFORE UPDATE ON additional_flag
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE additional_flag IS
    'Additional flags raised during vaccination assessment. Many-to-one child of grading_result.';
COMMENT ON COLUMN additional_flag.flag_id IS
    'Identifier of the additional flag (e.g. FLAG-VAX-001).';
COMMENT ON COLUMN additional_flag.category IS
    'Category grouping for the flag.';
COMMENT ON COLUMN additional_flag.message IS
    'Human-readable message describing the flag.';
COMMENT ON COLUMN additional_flag.priority IS
    'Flag priority: high, medium, or low.';

COMMENT ON COLUMN additional_flag.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN additional_flag.grading_result_id IS
    'Foreign key to the grading_result table.';
COMMENT ON COLUMN additional_flag.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN additional_flag.updated_at IS
    'Timestamp when this row was last updated.';
