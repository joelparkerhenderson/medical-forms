CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,
    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    risk_level VARCHAR(10) NOT NULL
        CHECK (risk_level IN ('high', 'medium', 'low'))
);

CREATE INDEX idx_grading_fired_rule_result
    ON grading_fired_rule(grading_result_id);

COMMENT ON TABLE grading_fired_rule IS
    'Individual risk rules that fired during the Heart Health Check grading. Many-to-one child of grading_result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Rule identifier (e.g. HHC-001).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Risk factor category (e.g. Blood Pressure, Diabetes).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the fired rule.';
COMMENT ON COLUMN grading_fired_rule.risk_level IS
    'Risk level: high, medium, or low.';

COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the grading_result table.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_fired_rule.deleted_at IS
    'Timestamp when this row was deleted.';
