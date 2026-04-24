CREATE TABLE fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    concern_level VARCHAR(10) NOT NULL DEFAULT 'low'
        CHECK (concern_level IN ('high', 'medium', 'low')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_fired_rule_updated_at
    BEFORE UPDATE ON fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE fired_rule IS
    'Vaccination rules that fired during assessment grading. Many-to-one child of grading_result.';
COMMENT ON COLUMN fired_rule.rule_id IS
    'Identifier of the vaccination rule that fired (e.g. VAX-001).';
COMMENT ON COLUMN fired_rule.category IS
    'Category the rule belongs to (e.g. Childhood, Adult, Contraindication).';
COMMENT ON COLUMN fired_rule.concern_level IS
    'Concern level: high, medium, or low.';

COMMENT ON COLUMN fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN fired_rule.grading_result_id IS
    'Foreign key to the grading_result table.';
COMMENT ON COLUMN fired_rule.description IS
    'Description.';
COMMENT ON COLUMN fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN fired_rule.updated_at IS
    'Timestamp when this row was last updated.';
