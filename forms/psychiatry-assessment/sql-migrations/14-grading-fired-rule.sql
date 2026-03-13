-- 14_grading_fired_rule.sql
-- Individual GAF scoring rules that fired during grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    gaf_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (gaf_impact IN ('minimal', 'mild', 'moderate', 'severe', 'extreme', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual GAF scoring rules that evaluated to true during grading.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. MSE-001, RISK-002, MOOD-003).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Mental Status Exam, Risk Assessment, Mood and Anxiety, Substance Use).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule condition.';
COMMENT ON COLUMN grading_fired_rule.gaf_impact IS
    'Impact on GAF score contributed by this rule: minimal, mild, moderate, severe, or extreme.';
