-- 14_grading_fired_rule.sql
-- Individual visual acuity rules that fired during grading.

CREATE TABLE grading_fired_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    grading_result_id UUID NOT NULL
        REFERENCES grading_result(id) ON DELETE CASCADE,

    rule_id VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    severity_level VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (severity_level IN ('normal', 'mild-impairment', 'moderate-impairment', 'severe-impairment', 'near-blindness', 'blindness', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_fired_rule_updated_at
    BEFORE UPDATE ON grading_fired_rule
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_fired_rule IS
    'Individual visual acuity classification rules that evaluated to true during grading of the ophthalmology assessment.';
COMMENT ON COLUMN grading_fired_rule.rule_id IS
    'Identifier of the rule that fired (e.g. VA-ACUITY-001, VA-FIELD-001).';
COMMENT ON COLUMN grading_fired_rule.category IS
    'Category of the rule (e.g. Visual Acuity, Visual Field, IOP, Posterior Segment).';
COMMENT ON COLUMN grading_fired_rule.description IS
    'Human-readable description of the rule and why it fired.';
COMMENT ON COLUMN grading_fired_rule.severity_level IS
    'Visual acuity grade contributed by this rule.';
