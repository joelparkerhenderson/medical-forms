-- 13_grading_fired_rule.sql
-- Individual candidacy rules that fired during hearing aid assessment grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    handicap_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (handicap_level IN ('no-handicap', 'mild-moderate', 'significant', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual hearing aid candidacy rules that evaluated to true during HHIE-S grading.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. HH-001, AU-002, CD-003).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. HHIE-S, Audiogram, Communication, Ear Examination).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule.';
COMMENT ON COLUMN grading_fired_rule.handicap_level IS
    'Handicap level contributed by this rule: no-handicap, mild-moderate, significant, or empty string.';
