CREATE TABLE grading_fired_rule (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,

    -- The rule that fired
    rule_id             TEXT NOT NULL REFERENCES reba_rule(id),

    -- Denormalized fields from the rule at time of grading
    system              TEXT NOT NULL,
    description         TEXT NOT NULL,
    score               INTEGER NOT NULL CHECK (score >= 0 AND score <= 15),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate rule entries per grading
    CONSTRAINT uq_grading_fired_rule UNIQUE (grading_result_id, rule_id)
);

CREATE INDEX idx_grading_fired_rule_result ON grading_fired_rule(grading_result_id);

COMMENT ON TABLE grading_fired_rule IS
    'Denormalized record of each REBA rule that fired during grading. Preserves exact context for clinical audit.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'FK to the grading result this fired rule belongs to.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'FK to the REBA rule that fired.';
COMMENT ON COLUMN grading_fired_rule.system IS
    'Body system or category (denormalized from reba_rule at grading time).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Rule description (denormalized from reba_rule at grading time).';
COMMENT ON COLUMN grading_fired_rule.score IS
    'Score contribution (denormalized from reba_rule at grading time).';

COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
