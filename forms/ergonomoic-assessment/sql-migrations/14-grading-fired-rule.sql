-- 14_grading_fired_rule.sql
-- Individual REBA and ergonomic rules that fired during grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('negligible', 'low', 'medium', 'high', 'very_high', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual ergonomic assessment rules that evaluated to true during REBA grading.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. REBA-001, MH-002, REP-003).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Posture, Manual Handling, Repetitive Tasks, Workstation).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the ergonomic risk detected.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS
    'Risk level contributed by this rule.';
