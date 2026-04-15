-- 06-grading-fired-rule.sql
-- Individual validation rules that fired during care privacy notice completeness checking.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_code VARCHAR(50) NOT NULL DEFAULT '',
    rule_name VARCHAR(255) NOT NULL DEFAULT '',
    severity VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (severity IN ('error', 'warning', 'info')),
    message TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual validation rules that evaluated to true during care privacy notice completeness checking.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading result.';
COMMENT ON COLUMN grading_fired_rule.rule_code IS
    'Short machine-readable code identifying the rule (e.g. PRIV-ACK-001).';
COMMENT ON COLUMN grading_fired_rule.rule_name IS
    'Human-readable name of the validation rule.';
COMMENT ON COLUMN grading_fired_rule.severity IS
    'Severity level of the fired rule: error, warning, or info.';
COMMENT ON COLUMN grading_fired_rule.message IS
    'Human-readable message describing the validation issue.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when the row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when the row was last updated.';
