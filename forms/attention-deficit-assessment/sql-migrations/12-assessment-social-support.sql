-- 12_assessment_social_support.sql
-- Social and support section of the attention deficit assessment.

CREATE TABLE assessment_social_support (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    living_situation VARCHAR(50) NOT NULL DEFAULT '',
    employment_status VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'student', 'retired', 'disability', '')),
    has_support_network VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_support_network IN ('yes', 'no', '')),
    support_network_details TEXT NOT NULL DEFAULT '',
    coping_strategies TEXT NOT NULL DEFAULT '',
    risk_taking_behaviour VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (risk_taking_behaviour IN ('yes', 'no', '')),
    risk_behaviour_details TEXT NOT NULL DEFAULT '',
    legal_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (legal_issues IN ('yes', 'no', '')),
    legal_details TEXT NOT NULL DEFAULT '',
    caffeine_use TEXT NOT NULL DEFAULT '',
    alcohol_use TEXT NOT NULL DEFAULT '',
    recreational_drug_use TEXT NOT NULL DEFAULT '',
    goals_for_treatment TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_support_updated_at
    BEFORE UPDATE ON assessment_social_support
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_support IS
    'Social and support section: living situation, employment, support network, risk behaviours, and treatment goals. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_support.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_support.living_situation IS
    'Current living situation (e.g. alone, with partner, with family, shared house).';
COMMENT ON COLUMN assessment_social_support.employment_status IS
    'Employment status: employed, unemployed, student, retired, disability, or empty string if unanswered.';
COMMENT ON COLUMN assessment_social_support.has_support_network IS
    'Whether the patient has a support network.';
COMMENT ON COLUMN assessment_social_support.support_network_details IS
    'Details of the support network.';
COMMENT ON COLUMN assessment_social_support.coping_strategies IS
    'Current coping strategies for managing ADHD symptoms.';
COMMENT ON COLUMN assessment_social_support.risk_taking_behaviour IS
    'Whether the patient engages in risk-taking behaviour.';
COMMENT ON COLUMN assessment_social_support.risk_behaviour_details IS
    'Details of risk-taking behaviours.';
COMMENT ON COLUMN assessment_social_support.legal_issues IS
    'Whether the patient has had legal issues related to ADHD symptoms.';
COMMENT ON COLUMN assessment_social_support.legal_details IS
    'Details of legal issues.';
COMMENT ON COLUMN assessment_social_support.caffeine_use IS
    'Caffeine consumption patterns (often used as self-medication).';
COMMENT ON COLUMN assessment_social_support.alcohol_use IS
    'Alcohol consumption patterns.';
COMMENT ON COLUMN assessment_social_support.recreational_drug_use IS
    'Recreational drug use history.';
COMMENT ON COLUMN assessment_social_support.goals_for_treatment IS
    'Patient goals and expectations for ADHD treatment.';
