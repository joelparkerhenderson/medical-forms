-- 07_assessment_risk_assessment.sql
-- Risk assessment section of the mental health assessment.

CREATE TABLE assessment_risk_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    suicidal_ideation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation IN ('yes', 'no', '')),
    suicidal_ideation_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation_frequency IN ('rarely', 'sometimes', 'often', 'constant', '')),
    suicidal_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_plan IN ('yes', 'no', '')),
    suicidal_intent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_intent IN ('yes', 'no', '')),
    previous_suicide_attempts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_suicide_attempts IN ('yes', 'no', '')),
    previous_attempt_count INTEGER
        CHECK (previous_attempt_count IS NULL OR previous_attempt_count >= 0),
    previous_attempt_details TEXT NOT NULL DEFAULT '',
    self_harm VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_harm IN ('yes', 'no', '')),
    self_harm_type TEXT NOT NULL DEFAULT '',
    harm_to_others VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (harm_to_others IN ('yes', 'no', '')),
    harm_to_others_details TEXT NOT NULL DEFAULT '',
    access_to_means VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (access_to_means IN ('yes', 'no', '')),
    access_to_means_details TEXT NOT NULL DEFAULT '',
    protective_factors TEXT NOT NULL DEFAULT '',
    overall_risk_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'imminent', '')),
    safety_plan_in_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safety_plan_in_place IN ('yes', 'no', '')),
    risk_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risk_assessment_updated_at
    BEFORE UPDATE ON assessment_risk_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risk_assessment IS
    'Risk assessment section: suicidal ideation, self-harm, harm to others, and safety planning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risk_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_ideation IS
    'Whether the patient reports suicidal ideation: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_ideation_frequency IS
    'Frequency of suicidal thoughts: rarely, sometimes, often, constant, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_plan IS
    'Whether the patient has a specific suicide plan: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_intent IS
    'Whether the patient reports intent to act on suicidal thoughts: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.previous_suicide_attempts IS
    'Whether the patient has previous suicide attempts: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.previous_attempt_count IS
    'Number of previous suicide attempts, if applicable.';
COMMENT ON COLUMN assessment_risk_assessment.previous_attempt_details IS
    'Free-text details of previous suicide attempts.';
COMMENT ON COLUMN assessment_risk_assessment.self_harm IS
    'Whether the patient engages in self-harm: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.self_harm_type IS
    'Free-text description of self-harm methods.';
COMMENT ON COLUMN assessment_risk_assessment.harm_to_others IS
    'Whether the patient reports thoughts of harm to others: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.harm_to_others_details IS
    'Free-text details of harm-to-others risk.';
COMMENT ON COLUMN assessment_risk_assessment.access_to_means IS
    'Whether the patient has access to means of self-harm: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.access_to_means_details IS
    'Free-text details of access to means.';
COMMENT ON COLUMN assessment_risk_assessment.protective_factors IS
    'Free-text description of protective factors (e.g. social support, children, religious beliefs).';
COMMENT ON COLUMN assessment_risk_assessment.overall_risk_level IS
    'Overall risk level: low, moderate, high, imminent, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.safety_plan_in_place IS
    'Whether a safety plan is in place: yes, no, or empty string.';
COMMENT ON COLUMN assessment_risk_assessment.risk_notes IS
    'Free-text clinician notes on risk assessment.';
