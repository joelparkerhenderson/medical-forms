-- ============================================================
-- 21_grading_fired_rule.sql
-- Fired rules for a grading result (many-to-one).
-- ============================================================
-- Each row records one ASA rule that fired during grading.
-- Rule metadata is denormalized (copied at grading time) so
-- the audit trail survives future rule catalogue changes.
-- Also holds an FK to asa_rule for join queries.
-- ============================================================

CREATE TABLE grading_fired_rule (
    -- Primary key
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: one grading result can have many fired rules
    grading_result_id   UUID NOT NULL REFERENCES grading_result(id) ON DELETE CASCADE,

    -- FK to the rule catalogue (may be NULL if rule is retired)
    asa_rule_id         TEXT REFERENCES asa_rule(id) ON DELETE SET NULL,

    -- Denormalized snapshot of the rule at grading time
    rule_system         TEXT NOT NULL,
    rule_description    TEXT NOT NULL,
    rule_grade          INTEGER NOT NULL CHECK (rule_grade BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all fired rules for a grading result
CREATE INDEX idx_grading_fired_rule_grading_result_id
    ON grading_fired_rule(grading_result_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Many-to-one with grading_result. Each row is one ASA rule that fired. Denormalized for audit.';
COMMENT ON COLUMN grading_fired_rule.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'FK to grading_result. One result may have many fired rules.';
COMMENT ON COLUMN grading_fired_rule.asa_rule_id IS
    'FK to asa_rule catalogue. SET NULL on delete so audit rows survive rule removal.';
COMMENT ON COLUMN grading_fired_rule.rule_system IS
    'Body system at grading time (denormalized from asa_rule).';
COMMENT ON COLUMN grading_fired_rule.rule_description IS
    'Rule description at grading time (denormalized from asa_rule).';
COMMENT ON COLUMN grading_fired_rule.rule_grade IS
    'ASA grade at grading time (denormalized from asa_rule).';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
