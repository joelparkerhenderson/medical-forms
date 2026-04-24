CREATE TABLE validation_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    validation_result_id UUID NOT NULL
        REFERENCES validation_result(id) ON DELETE CASCADE,
    rule_id VARCHAR(30) NOT NULL,
    domain VARCHAR(50) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    score SMALLINT NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_validation_fired_rule_updated_at
    BEFORE UPDATE ON validation_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE validation_fired_rule IS
    'Validation rules that fired during assessment. Many-to-one child of validation_result.';
COMMENT ON COLUMN validation_fired_rule.validation_result_id IS
    'Foreign key to the parent validation result.';
COMMENT ON COLUMN validation_fired_rule.rule_id IS
    'Identifier of the validation rule that fired.';
COMMENT ON COLUMN validation_fired_rule.domain IS
    'Domain or category the rule belongs to.';
COMMENT ON COLUMN validation_fired_rule.description IS
    'Human-readable description of what the rule checks.';
COMMENT ON COLUMN validation_fired_rule.score IS
    'Score contribution from this fired rule.';

COMMENT ON COLUMN validation_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN validation_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN validation_fired_rule.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN validation_fired_rule.deleted_at IS
    'Timestamp when this row was deleted.';
