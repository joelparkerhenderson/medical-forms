-- 13_grading_fired_rule.sql
-- Individual frailty rules that fired during gerontology assessment grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    cfs_contribution INTEGER NOT NULL DEFAULT 0
        CHECK (cfs_contribution >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual frailty rules that evaluated to true during CFS grading.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. FA-001, CS-002, MF-003).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Functional, Cognitive, Mobility, Nutrition, Polypharmacy).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule.';
COMMENT ON COLUMN grading_fired_rule.cfs_contribution IS
    'Contribution of this rule to the CFS score.';
