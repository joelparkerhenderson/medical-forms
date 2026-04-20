-- 10_assessment_social_legal_impact.sql
-- Social and legal impact section of the substance abuse assessment.

CREATE TABLE assessment_social_legal_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'retired', 'sick-leave', 'student', 'other', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    employment_affected VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (employment_affected IN ('yes', 'no', '')),
    housing_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (housing_status IN ('stable', 'unstable', 'homeless', 'temporary', 'supported', '')),
    relationship_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relationship_status IN ('single', 'partnered', 'married', 'separated', 'divorced', 'widowed', '')),
    relationship_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (relationship_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    dependents INTEGER
        CHECK (dependents IS NULL OR dependents >= 0),
    children_safeguarding_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (children_safeguarding_concerns IN ('yes', 'no', '')),
    social_support VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (social_support IN ('good', 'limited', 'none', '')),
    criminal_record VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (criminal_record IN ('yes', 'no', '')),
    criminal_record_details TEXT NOT NULL DEFAULT '',
    current_legal_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_legal_issues IN ('yes', 'no', '')),
    current_legal_details TEXT NOT NULL DEFAULT '',
    dui_dwi_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dui_dwi_history IN ('yes', 'no', '')),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('driving', 'not-driving', 'dvla-notified', 'licence-revoked', '')),
    financial_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (financial_difficulties IN ('yes', 'no', '')),
    domestic_violence VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (domestic_violence IN ('yes', 'no', '')),
    domestic_violence_details TEXT NOT NULL DEFAULT '',
    social_legal_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_legal_impact_updated_at
    BEFORE UPDATE ON assessment_social_legal_impact
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_legal_impact IS
    'Social and legal impact section: employment, housing, relationships, criminal history, safeguarding. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_legal_impact.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_legal_impact.employment_status IS
    'Employment status: employed, unemployed, retired, sick-leave, student, other, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.occupation IS
    'Patient occupation or former occupation.';
COMMENT ON COLUMN assessment_social_legal_impact.employment_affected IS
    'Whether employment has been affected by substance use: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.housing_status IS
    'Housing status: stable, unstable, homeless, temporary, supported, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.relationship_status IS
    'Relationship status: single, partnered, married, separated, divorced, widowed, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.relationship_impact IS
    'Impact on relationships: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.dependents IS
    'Number of dependents.';
COMMENT ON COLUMN assessment_social_legal_impact.children_safeguarding_concerns IS
    'Whether there are safeguarding concerns for children: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.social_support IS
    'Level of social support: good, limited, none, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.criminal_record IS
    'Whether the patient has a criminal record: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.criminal_record_details IS
    'Details of criminal record.';
COMMENT ON COLUMN assessment_social_legal_impact.current_legal_issues IS
    'Whether the patient has current legal issues: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.current_legal_details IS
    'Details of current legal issues.';
COMMENT ON COLUMN assessment_social_legal_impact.dui_dwi_history IS
    'Whether the patient has a history of DUI/DWI: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.driving_status IS
    'Driving status: driving, not-driving, dvla-notified, licence-revoked, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.financial_difficulties IS
    'Whether the patient has financial difficulties related to substance use: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.domestic_violence IS
    'Whether there is domestic violence involvement: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_legal_impact.domestic_violence_details IS
    'Details of domestic violence involvement.';
COMMENT ON COLUMN assessment_social_legal_impact.social_legal_notes IS
    'Additional clinician notes on social and legal impact.';
