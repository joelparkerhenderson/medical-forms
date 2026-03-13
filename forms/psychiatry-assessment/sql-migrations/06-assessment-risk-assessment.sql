-- 06_assessment_risk_assessment.sql
-- Risk assessment section of the psychiatry assessment.

CREATE TABLE assessment_risk_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    suicidal_ideation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation IN ('none', 'passive', 'active', '')),
    suicidal_ideation_details TEXT NOT NULL DEFAULT '',
    suicidal_plan VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_plan IN ('yes', 'no', '')),
    suicidal_plan_details TEXT NOT NULL DEFAULT '',
    suicidal_intent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_intent IN ('yes', 'no', '')),
    access_to_means VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (access_to_means IN ('yes', 'no', '')),
    means_details TEXT NOT NULL DEFAULT '',
    previous_suicide_attempts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_suicide_attempts IN ('yes', 'no', '')),
    attempt_count INTEGER
        CHECK (attempt_count IS NULL OR attempt_count >= 0),
    attempt_details TEXT NOT NULL DEFAULT '',
    self_harm_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_harm_current IN ('yes', 'no', '')),
    self_harm_details TEXT NOT NULL DEFAULT '',
    risk_to_others VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (risk_to_others IN ('none', 'low', 'moderate', 'high', '')),
    risk_to_others_details TEXT NOT NULL DEFAULT '',
    violence_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (violence_history IN ('yes', 'no', '')),
    violence_details TEXT NOT NULL DEFAULT '',
    vulnerability VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (vulnerability IN ('none', 'low', 'moderate', 'high', '')),
    vulnerability_details TEXT NOT NULL DEFAULT '',
    safeguarding_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_concerns IN ('yes', 'no', '')),
    safeguarding_details TEXT NOT NULL DEFAULT '',
    protective_factors TEXT NOT NULL DEFAULT '',
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'imminent', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_risk_assessment_updated_at
    BEFORE UPDATE ON assessment_risk_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_risk_assessment IS
    'Risk assessment section: suicidality, self-harm, risk to others, vulnerability, safeguarding, and protective factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_risk_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_ideation IS
    'Suicidal ideation status: none, passive, active, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_plan IS
    'Whether the patient has a specific suicide plan.';
COMMENT ON COLUMN assessment_risk_assessment.suicidal_intent IS
    'Whether the patient expresses intent to act on suicidal thoughts.';
COMMENT ON COLUMN assessment_risk_assessment.access_to_means IS
    'Whether the patient has access to means of self-harm.';
COMMENT ON COLUMN assessment_risk_assessment.previous_suicide_attempts IS
    'Whether the patient has made previous suicide attempts.';
COMMENT ON COLUMN assessment_risk_assessment.self_harm_current IS
    'Whether the patient is currently engaging in self-harm.';
COMMENT ON COLUMN assessment_risk_assessment.risk_to_others IS
    'Level of risk to others: none, low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.vulnerability IS
    'Vulnerability level (exploitation, neglect): none, low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_risk_assessment.safeguarding_concerns IS
    'Whether there are safeguarding concerns (children or vulnerable adults).';
COMMENT ON COLUMN assessment_risk_assessment.protective_factors IS
    'Free-text description of protective factors (family support, employment, etc.).';
COMMENT ON COLUMN assessment_risk_assessment.overall_risk_level IS
    'Overall risk level: low, moderate, high, imminent, or empty.';
