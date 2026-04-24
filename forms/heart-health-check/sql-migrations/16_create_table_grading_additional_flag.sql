CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    flag_id VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL
        CHECK (priority IN ('high', 'medium', 'low')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grading_additional_flag_result
    ON grading_additional_flag(grading_result_id);

COMMENT ON TABLE grading_additional_flag IS
    'Additional clinical flags raised during the Heart Health Check grading. Many-to-one child of grading_result.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Flag identifier (e.g. FLAG-BP-001).';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Clinical category of the flag (e.g. Blood Pressure, Eligibility).';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable description of the flagged issue.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Flag priority: high, medium, or low.';

COMMENT ON COLUMN grading_additional_flag.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'Foreign key to the grading_result table.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Timestamp when this row was created.';
