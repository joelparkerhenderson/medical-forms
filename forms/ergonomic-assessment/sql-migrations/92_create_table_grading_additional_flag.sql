CREATE TABLE grading_additional_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,
    -- Flag identifier (e.g. FLAG-POSTURE-001, FLAG-RSI-001)
    flag_id             TEXT NOT NULL,
    -- Category of the flag
    category            TEXT NOT NULL,
    -- Human-readable alert message
    message             TEXT NOT NULL,
    -- Priority level
    priority            TEXT NOT NULL
                        CHECK (priority IN ('high', 'medium', 'low')),
    -- Prevent duplicate flags per grading
    CONSTRAINT uq_grading_additional_flag UNIQUE (grading_result_id, flag_id)
);

CREATE INDEX idx_grading_additional_flag_result ON grading_additional_flag(grading_result_id);

COMMENT ON TABLE grading_additional_flag IS
    'Additional safety flags raised during grading, independent of REBA score. Actionable alerts for clinician review.';
COMMENT ON COLUMN grading_additional_flag.flag_id IS
    'Flag identifier, e.g. FLAG-POSTURE-001, FLAG-RSI-001, FLAG-MANUAL-001.';
COMMENT ON COLUMN grading_additional_flag.category IS
    'Category of the flag, e.g. Posture, Medical History, Manual Handling, Symptoms, Psychosocial.';
COMMENT ON COLUMN grading_additional_flag.message IS
    'Human-readable alert message describing the flagged condition.';
COMMENT ON COLUMN grading_additional_flag.priority IS
    'Flag priority: high (urgent action), medium (review needed), low (informational).';

COMMENT ON COLUMN grading_additional_flag.grading_result_id IS
    'Foreign key to the grading_result table.';
COMMENT ON COLUMN grading_additional_flag.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_additional_flag.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_additional_flag.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_additional_flag.deleted_at IS
    'Timestamp when this row was deleted.';
