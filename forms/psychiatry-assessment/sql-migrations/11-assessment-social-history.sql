-- 11_assessment_social_history.sql
-- Social history section of the psychiatry assessment.

CREATE TABLE assessment_social_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    living_arrangement VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (living_arrangement IN ('alone', 'with-partner', 'with-family', 'supported-housing', 'hostel', 'homeless', 'inpatient', 'other', '')),
    living_arrangement_details TEXT NOT NULL DEFAULT '',
    relationship_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relationship_status IN ('single', 'partnered', 'married', 'separated', 'divorced', 'widowed', '')),
    dependants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dependants IN ('yes', 'no', '')),
    dependant_details TEXT NOT NULL DEFAULT '',
    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'student', 'retired', 'sick-leave', 'disability', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    financial_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (financial_difficulties IN ('yes', 'no', '')),
    benefits_received TEXT NOT NULL DEFAULT '',
    forensic_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (forensic_history IN ('yes', 'no', '')),
    forensic_details TEXT NOT NULL DEFAULT '',
    current_legal_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_legal_issues IN ('yes', 'no', '')),
    legal_details TEXT NOT NULL DEFAULT '',
    immigration_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (immigration_status IN ('citizen', 'settled', 'leave-to-remain', 'asylum-seeker', 'undocumented', '')),
    social_support TEXT NOT NULL DEFAULT '',
    hobbies_interests TEXT NOT NULL DEFAULT '',
    spiritual_beliefs TEXT NOT NULL DEFAULT '',
    childhood_adversity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childhood_adversity IN ('yes', 'no', '')),
    childhood_adversity_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_history_updated_at
    BEFORE UPDATE ON assessment_social_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_history IS
    'Social history section: living arrangements, relationships, employment, forensic history, social support, and adverse childhood experiences. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_history.living_arrangement IS
    'Living arrangement: alone, with-partner, with-family, supported-housing, hostel, homeless, inpatient, other, or empty.';
COMMENT ON COLUMN assessment_social_history.relationship_status IS
    'Relationship status: single, partnered, married, separated, divorced, widowed, or empty.';
COMMENT ON COLUMN assessment_social_history.dependants IS
    'Whether the patient has dependants (children or other).';
COMMENT ON COLUMN assessment_social_history.employment_status IS
    'Employment status: employed, unemployed, student, retired, sick-leave, disability, or empty.';
COMMENT ON COLUMN assessment_social_history.financial_difficulties IS
    'Whether the patient is experiencing financial difficulties.';
COMMENT ON COLUMN assessment_social_history.forensic_history IS
    'Whether the patient has a forensic (criminal justice) history.';
COMMENT ON COLUMN assessment_social_history.current_legal_issues IS
    'Whether the patient has current legal issues.';
COMMENT ON COLUMN assessment_social_history.immigration_status IS
    'Immigration status: citizen, settled, leave-to-remain, asylum-seeker, undocumented, or empty.';
COMMENT ON COLUMN assessment_social_history.childhood_adversity IS
    'Whether the patient experienced adverse childhood experiences (ACEs).';
