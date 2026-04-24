CREATE TABLE grading_fired_rule (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: one grading result can have many fired rules
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,

    -- FK to the rule catalogue (may be NULL if rule is retired)
    pvt_rule_id         TEXT REFERENCES pvt_rule(id) ON DELETE SET NULL,

    -- Denormalized snapshot of the rule at grading time
    rule_category       TEXT NOT NULL,
    rule_description    TEXT NOT NULL,
    rule_risk_level     TEXT NOT NULL CHECK (rule_risk_level IN ('high', 'medium', 'low')),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all fired rules for a grading result
CREATE INDEX idx_grading_fired_rule_grading_result_id
    ON grading_fired_rule(grading_result_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Many-to-one with grading_result. Each row is one PVT risk rule that fired. Denormalized for audit.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'FK to grading_result. One result may have many fired rules.';
COMMENT ON COLUMN grading_fired_rule.pvt_rule_id IS
    'FK to pvt_rule catalogue. SET NULL on delete so audit rows survive rule removal.';
COMMENT ON COLUMN grading_fired_rule.rule_category IS
    'Clinical category at grading time (denormalized from pvt_rule).';
COMMENT ON COLUMN grading_fired_rule.rule_description IS
    'Rule description at grading time (denormalized from pvt_rule).';
COMMENT ON COLUMN grading_fired_rule.rule_risk_level IS
    'Risk level at grading time: high, medium, or low (denormalized from pvt_rule).';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
