-- 08_assessment_social_occupational.sql
-- Social and occupational impact section of the seasonal affective disorder assessment.

CREATE TABLE assessment_social_occupational (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    social_withdrawal VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (social_withdrawal IN ('none', 'mild', 'moderate', 'severe', '')),
    relationship_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (relationship_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    work_performance VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (work_performance IN ('normal', 'slightly-reduced', 'significantly-reduced', 'unable-to-work', '')),
    days_missed_work INTEGER
        CHECK (days_missed_work IS NULL OR days_missed_work >= 0),
    daily_activities_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (daily_activities_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    hobbies_interest VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hobbies_interest IN ('normal', 'reduced', 'none', '')),
    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'retired', 'sick-leave', 'student', 'other', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    social_occupational_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_occupational_updated_at
    BEFORE UPDATE ON assessment_social_occupational
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_occupational IS
    'Social and occupational impact section: withdrawal, relationships, work performance, daily activities. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_occupational.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_occupational.social_withdrawal IS
    'Degree of social withdrawal: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_social_occupational.relationship_impact IS
    'Impact on personal relationships: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_social_occupational.work_performance IS
    'Impact on work performance: normal, slightly-reduced, significantly-reduced, unable-to-work, or empty.';
COMMENT ON COLUMN assessment_social_occupational.days_missed_work IS
    'Number of days missed from work due to SAD symptoms in the current season.';
COMMENT ON COLUMN assessment_social_occupational.daily_activities_impact IS
    'Impact on daily activities: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_social_occupational.hobbies_interest IS
    'Interest in hobbies and leisure: normal, reduced, none, or empty.';
COMMENT ON COLUMN assessment_social_occupational.employment_status IS
    'Employment status: employed, unemployed, retired, sick-leave, student, other, or empty.';
COMMENT ON COLUMN assessment_social_occupational.occupation IS
    'Patient occupation or former occupation.';
COMMENT ON COLUMN assessment_social_occupational.social_occupational_notes IS
    'Additional clinician notes on social and occupational impact.';
