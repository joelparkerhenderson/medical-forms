-- 14_grading_fired_rule.sql
-- Individual eligibility and severity rules that fired during HRT assessment grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('none', 'mild', 'moderate', 'severe', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual HRT eligibility and severity rules that evaluated to true during MRS grading.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. VM-001, BH-002, CV-003, CI-004).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Vasomotor, Bone Health, Cardiovascular, Breast Health, Contraindication).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS
    'Severity level contributed by this rule: none, mild, moderate, severe, or empty string.';
