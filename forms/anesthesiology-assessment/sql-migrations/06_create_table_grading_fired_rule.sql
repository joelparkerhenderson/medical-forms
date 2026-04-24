CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('low', 'medium', 'high', 'critical', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS 'Individual rules that evaluated to true during grading.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS 'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS 'Stable identifier of the rule that fired.';
COMMENT ON COLUMN grading_fired_rule.category IS 'Category / domain of the rule.';
COMMENT ON COLUMN grading_fired_rule.description IS 'Human-readable description of the rule condition.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS 'Severity of the finding: low, medium, high, critical, or empty for non-severity rules.';

COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when this row was last updated.';
