-- 06_grading_fired_rule.sql
-- Individual validation rules that fired during completeness checking.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('complete', 'incomplete', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual validation rules that evaluated to true during care privacy notice completeness checking.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. REQ-PC-001, REQ-AK-001).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Practice Configuration, Acknowledgment).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the validation rule.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS
    'Validation result contributed by this rule: complete or incomplete.';
