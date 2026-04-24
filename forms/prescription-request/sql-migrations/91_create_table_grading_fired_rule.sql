CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,
    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('routine', 'urgent', 'emergency', ''))
);

CREATE TRIGGER trigger_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual priority classification rules that fired during grading of the prescription request.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS 'Identifier of the rule that fired (e.g. RX-EM-001).';
COMMENT ON COLUMN grading_fired_rule.category IS 'Category of the rule (e.g. Emergency, Substitution, Completeness).';
COMMENT ON COLUMN grading_fired_rule.description IS 'Human-readable description of the rule.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS 'Priority level contributed by this rule: routine, urgent, emergency, or empty.';
--rollback DROP TABLE grading_fired_rule;

COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the grading_result table.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_fired_rule.deleted_at IS
    'Timestamp when this row was deleted.';
