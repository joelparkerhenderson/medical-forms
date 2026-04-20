-- 10_assessment_psychological.sql
-- Psychological assessment section for living donors.

CREATE TABLE assessment_psychological (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    living_donor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (living_donor IN ('yes', 'no', '')),
    independent_assessment_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (independent_assessment_completed IN ('yes', 'no', '')),
    assessor_name VARCHAR(255) NOT NULL DEFAULT '',
    assessor_role VARCHAR(255) NOT NULL DEFAULT '',
    voluntary_consent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (voluntary_consent IN ('yes', 'no', '')),
    coercion_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (coercion_concerns IN ('yes', 'no', '')),
    coercion_details TEXT NOT NULL DEFAULT '',
    understands_risks VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_risks IN ('yes', 'no', '')),
    understands_alternatives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (understands_alternatives IN ('yes', 'no', '')),
    mental_health_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mental_health_history IN ('yes', 'no', '')),
    mental_health_details TEXT NOT NULL DEFAULT '',
    capacity_to_consent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (capacity_to_consent IN ('yes', 'no', '')),
    support_network_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (support_network_adequate IN ('yes', 'no', '')),
    financial_incentive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (financial_incentive IN ('yes', 'no', '')),
    psychological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_psychological_updated_at
    BEFORE UPDATE ON assessment_psychological
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychological IS
    'Psychological assessment section for living donors: consent validation, coercion screening, mental capacity. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_psychological.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_psychological.living_donor IS
    'Whether this is a living donor assessment: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.independent_assessment_completed IS
    'Whether an independent psychological assessment has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.assessor_name IS
    'Name of the independent assessor.';
COMMENT ON COLUMN assessment_psychological.assessor_role IS
    'Role of the independent assessor.';
COMMENT ON COLUMN assessment_psychological.voluntary_consent IS
    'Whether consent is voluntary: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.coercion_concerns IS
    'Whether there are concerns about coercion: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.coercion_details IS
    'Details of coercion concerns if applicable.';
COMMENT ON COLUMN assessment_psychological.understands_risks IS
    'Whether the donor understands the risks: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.understands_alternatives IS
    'Whether the donor understands alternatives: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.mental_health_history IS
    'Whether the donor has a mental health history: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.mental_health_details IS
    'Details of mental health history.';
COMMENT ON COLUMN assessment_psychological.capacity_to_consent IS
    'Whether the donor has capacity to consent: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.support_network_adequate IS
    'Whether the donor has an adequate support network: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.financial_incentive IS
    'Whether there is evidence of financial incentive: yes, no, or empty.';
COMMENT ON COLUMN assessment_psychological.psychological_notes IS
    'Additional clinician notes on psychological assessment.';
