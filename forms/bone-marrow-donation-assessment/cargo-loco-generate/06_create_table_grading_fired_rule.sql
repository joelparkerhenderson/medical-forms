CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    completeness_level VARCHAR(12) NOT NULL DEFAULT ''
        CHECK (completeness_level IN ('complete', 'partial', 'incomplete', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual completeness rules that evaluated to true during advance statement grading.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. CMP-001, VAL-002).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Personal Information, Values, Care Preferences, Signatures).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule condition.';
COMMENT ON COLUMN grading_fired_rule.completeness_level IS
    'Completeness level contributed by this rule: complete, partial, or incomplete.';

COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when this row was updated.';
