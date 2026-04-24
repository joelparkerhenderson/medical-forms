CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    priority_level VARCHAR(10) NOT NULL DEFAULT 'routine'
        CHECK (priority_level IN ('routine', 'urgent', 'emergency')),
    rule_count INTEGER NOT NULL DEFAULT 0
        CHECK (rule_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed priority classification result for the prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN grading_result.priority_level IS 'Overall priority: routine, urgent, or emergency.';
COMMENT ON COLUMN grading_result.rule_count IS 'Total number of classification rules that fired.';
COMMENT ON COLUMN grading_result.graded_at IS 'Timestamp when the priority classification was computed.';
--rollback DROP TABLE grading_result;

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.prescription_request_id IS
    'Foreign key to the prescription_request table.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
