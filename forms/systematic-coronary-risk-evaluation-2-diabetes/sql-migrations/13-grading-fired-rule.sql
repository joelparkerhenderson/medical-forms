-- 13_grading_fired_rule.sql
-- Individual risk rules that fired during grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (risk_level IN ('high', 'medium', 'low', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual cardiovascular risk rules that evaluated to true during grading.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. CVR-001, CVR-002).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Cardiovascular History, Blood Pressure, Glycaemic Control).';
COMMENT ON COLUMN grading_fired_rule.risk_level IS
    'Risk level contributed by this rule: high, medium, or low.';
