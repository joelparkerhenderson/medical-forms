-- 06_assessment_productivity_activities.sql
-- Productivity activities section of the occupational therapy assessment (COPM domain).

CREATE TABLE assessment_productivity_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    employment_status VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed-full-time', 'employed-part-time', 'self-employed', 'unemployed', 'retired', 'student', 'homemaker', 'disability-leave', 'sick-leave', '')),
    work_duties_description TEXT NOT NULL DEFAULT '',
    work_limitations TEXT NOT NULL DEFAULT '',
    household_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (household_management IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    meal_preparation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (meal_preparation IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    financial_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (financial_management IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    community_access VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (community_access IN ('independent', 'modified-independent', 'supervision', 'minimal-assist', 'moderate-assist', 'maximal-assist', 'dependent', '')),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('drives', 'does-not-drive', 'licence-suspended', 'under-review', '')),
    childcare_responsibilities VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (childcare_responsibilities IN ('yes', 'no', '')),
    childcare_details TEXT NOT NULL DEFAULT '',
    productivity_concerns TEXT NOT NULL DEFAULT '',
    productivity_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_productivity_activities_updated_at
    BEFORE UPDATE ON assessment_productivity_activities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_productivity_activities IS
    'Productivity activities section: employment, household management, community access, and related concerns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_productivity_activities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_productivity_activities.employment_status IS
    'Current employment status of the patient.';
COMMENT ON COLUMN assessment_productivity_activities.work_duties_description IS
    'Description of current or most recent work duties and physical demands.';
COMMENT ON COLUMN assessment_productivity_activities.work_limitations IS
    'Specific work limitations or restrictions identified.';
COMMENT ON COLUMN assessment_productivity_activities.household_management IS
    'Independence level for household management tasks (cleaning, laundry).';
COMMENT ON COLUMN assessment_productivity_activities.meal_preparation IS
    'Independence level for meal planning and preparation.';
COMMENT ON COLUMN assessment_productivity_activities.financial_management IS
    'Independence level for financial management and budgeting.';
COMMENT ON COLUMN assessment_productivity_activities.community_access IS
    'Independence level for accessing community services and transport.';
COMMENT ON COLUMN assessment_productivity_activities.driving_status IS
    'Current driving status: drives, does-not-drive, licence-suspended, under-review, or empty.';
COMMENT ON COLUMN assessment_productivity_activities.childcare_responsibilities IS
    'Whether the patient has childcare responsibilities: yes, no, or empty.';
COMMENT ON COLUMN assessment_productivity_activities.childcare_details IS
    'Details of childcare responsibilities and any difficulties.';
COMMENT ON COLUMN assessment_productivity_activities.productivity_concerns IS
    'Free-text description of productivity-related concerns.';
COMMENT ON COLUMN assessment_productivity_activities.productivity_notes IS
    'Additional clinician notes on productivity performance.';
