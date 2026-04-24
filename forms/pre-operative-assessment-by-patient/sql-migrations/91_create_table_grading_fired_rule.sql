CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,
    rule_id VARCHAR(30) NOT NULL,
    instrument VARCHAR(20) NOT NULL
        CHECK (instrument IN ('asa', 'mallampati', 'rcri', 'stopbang', 'frailty')),
    grade VARCHAR(5) NOT NULL DEFAULT '',
    category VARCHAR(50) NOT NULL DEFAULT '',
    description VARCHAR(500) NOT NULL DEFAULT ''
);

CREATE INDEX idx_grading_fired_rule_grading_result_id
    ON grading_fired_rule(grading_result_id);

CREATE TRIGGER trigger_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Audit trail of every ASA / Mallampati / RCRI / STOP-BANG / frailty rule that fired for this assessment.';
COMMENT ON COLUMN grading_fired_rule.grading_result_id IS
    'Foreign key to the parent grading_result.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Stable rule identifier (e.g. R-ASA-III-02).';
COMMENT ON COLUMN grading_fired_rule.instrument IS
    'Scoring instrument the rule belongs to: asa, mallampati, rcri, stopbang, frailty.';
COMMENT ON COLUMN grading_fired_rule.grade IS
    'Grade contributed by this rule (e.g. III for ASA).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Body-system or risk category (e.g. cardiovascular, respiratory).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of why the rule fired.';

COMMENT ON COLUMN grading_fired_rule.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_fired_rule.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_fired_rule.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_fired_rule.deleted_at IS
    'Timestamp when this row was deleted.';
