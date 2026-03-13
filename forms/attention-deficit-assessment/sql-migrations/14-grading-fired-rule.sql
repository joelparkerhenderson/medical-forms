-- 14_grading_fired_rule.sql
-- Individual ASRS rules that fired during grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    screening_result VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (screening_result IN ('highly_consistent', 'unlikely', 'incomplete', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual ASRS screening rules that evaluated to true during attention deficit grading.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. ASRS-A-001, FUNC-002).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Part A Screener, Functional Impact, Childhood History, Comorbidity).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule condition.';
COMMENT ON COLUMN grading_fired_rule.screening_result IS
    'Screening result contributed by this rule: highly_consistent, unlikely, or incomplete.';
