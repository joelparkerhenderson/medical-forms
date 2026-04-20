-- 11_assessment_risk_assessment.sql
-- Risk assessment (self-harm) section of the seasonal affective disorder assessment.

CREATE TABLE assessment_risk_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    suicidal_ideation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation IN ('yes', 'no', '')),
    suicidal_ideation_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation_frequency IN ('rarely', 'sometimes', 'often', 'constantly', '')),
    suicidal_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_plan IN ('yes', 'no', '')),
    suicidal_intent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_intent IN ('yes', 'no', '')),
    previous_self_harm VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_self_harm IN ('yes', 'no', '')),
    previous_self_harm_details TEXT NOT NULL DEFAULT '',
    previous_suicide_attempt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_suicide_attempt IN ('yes', 'no', '')),
    previous_attempt_details TEXT NOT NULL DEFAULT '',
    hopelessness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hopelessness IN ('none', 'mild', 'moderate', 'severe', '')),
    protective_factors TEXT NOT NULL DEFAULT '',
    risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    safety_plan_in_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safety_plan_in_place IN ('yes', 'no', '')),
    risk_assessment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risk_assessment_updated_at
    BEFORE UPDATE ON assessment_risk_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risk_assessment IS
    'Risk assessment section: suicidal ideation, self-harm history, hopelessness, and safety planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risk_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_ideation IS
    'Whether the patient has current suicidal thoughts: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_ideation_frequency IS
    'Frequency of suicidal thoughts: rarely, sometimes, often, constantly, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_plan IS
    'Whether the patient has a specific plan for suicide: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_intent IS
    'Whether the patient has intent to act on suicidal thoughts: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.previous_self_harm IS
    'Whether the patient has a history of self-harm: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.previous_self_harm_details IS
    'Details of previous self-harm episodes.';
COMMENT ON COLUMN assessment_risk_assessment.previous_suicide_attempt IS
    'Whether the patient has a history of suicide attempts: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.previous_attempt_details IS
    'Details of previous suicide attempts.';
COMMENT ON COLUMN assessment_risk_assessment.hopelessness IS
    'Degree of hopelessness: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.protective_factors IS
    'Identified protective factors (e.g. family support, employment, faith).';
COMMENT ON COLUMN assessment_risk_assessment.risk_level IS
    'Clinician-assessed risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.safety_plan_in_place IS
    'Whether a safety plan has been agreed: yes, no, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.risk_assessment_notes IS
    'Additional clinician notes on risk assessment.';
