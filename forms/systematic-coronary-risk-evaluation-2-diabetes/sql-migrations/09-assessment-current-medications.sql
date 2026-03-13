-- 09_assessment_current_medications.sql
-- Current medications section of the assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    metformin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (metformin IN ('yes', 'no', '')),
    sglt2_inhibitor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sglt2_inhibitor IN ('yes', 'no', '')),
    glp1_agonist VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (glp1_agonist IN ('yes', 'no', '')),
    sulfonylurea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sulfonylurea IN ('yes', 'no', '')),
    dpp4_inhibitor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dpp4_inhibitor IN ('yes', 'no', '')),
    insulin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (insulin IN ('yes', 'no', '')),
    ace_inhibitor_or_arb VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ace_inhibitor_or_arb IN ('yes', 'no', '')),
    antiplatelet VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antiplatelet IN ('yes', 'no', '')),
    anticoagulant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticoagulant IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: diabetes, cardiovascular, and other medications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.metformin IS
    'Whether patient is taking metformin.';
COMMENT ON COLUMN assessment_current_medications.sglt2_inhibitor IS
    'Whether patient is taking an SGLT2 inhibitor.';
COMMENT ON COLUMN assessment_current_medications.glp1_agonist IS
    'Whether patient is taking a GLP-1 receptor agonist.';
COMMENT ON COLUMN assessment_current_medications.insulin IS
    'Whether patient is taking insulin.';
COMMENT ON COLUMN assessment_current_medications.ace_inhibitor_or_arb IS
    'Whether patient is taking an ACE inhibitor or ARB.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other medications.';
