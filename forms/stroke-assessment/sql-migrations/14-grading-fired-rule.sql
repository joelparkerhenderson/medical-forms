-- 14_grading_fired_rule.sql
-- Individual NIHSS rules that fired during stroke grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('no_stroke_symptoms', 'minor', 'moderate', 'moderate_to_severe', 'severe', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual NIHSS stroke severity classification rules that evaluated to true during grading.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. NIHSS-001, LOC-002, MOT-003).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Consciousness, Motor, Language, Sensory, Neglect).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of what the rule detected.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS
    'Stroke severity level contributed by this rule.';
