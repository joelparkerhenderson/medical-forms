-- 11_assessment_social_and_functional.sql
-- Social and functional section of the mental health assessment.

CREATE TABLE assessment_social_and_functional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'retired', 'student', 'sick-leave', 'disability', '')),
    employment_impact TEXT NOT NULL DEFAULT '',
    social_support VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_support IN ('strong', 'moderate', 'limited', 'none', '')),
    social_isolation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_isolation IN ('yes', 'no', '')),
    relationship_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (relationship_difficulties IN ('yes', 'no', '')),
    relationship_details TEXT NOT NULL DEFAULT '',
    financial_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (financial_difficulties IN ('yes', 'no', '')),
    housing_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (housing_issues IN ('yes', 'no', '')),
    housing_details TEXT NOT NULL DEFAULT '',
    caring_responsibilities VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (caring_responsibilities IN ('yes', 'no', '')),
    caring_details TEXT NOT NULL DEFAULT '',
    daily_functioning VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (daily_functioning IN ('independent', 'some-difficulty', 'significant-difficulty', 'dependent', '')),
    hobbies_and_interests TEXT NOT NULL DEFAULT '',
    exercise_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('daily', 'several-per-week', 'weekly', 'rarely', 'never', '')),
    social_functional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_and_functional_updated_at
    BEFORE UPDATE ON assessment_social_and_functional
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_and_functional IS
    'Social and functional section: employment, social support, relationships, housing, and daily functioning. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_and_functional.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_and_functional.employment_status IS
    'Employment status: employed, unemployed, retired, student, sick-leave, disability, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.employment_impact IS
    'Free-text description of how mental health impacts employment.';
COMMENT ON COLUMN assessment_social_and_functional.social_support IS
    'Level of social support: strong, moderate, limited, none, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.social_isolation IS
    'Whether the patient experiences social isolation: yes, no, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.relationship_difficulties IS
    'Whether the patient has relationship difficulties: yes, no, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.relationship_details IS
    'Free-text details of relationship difficulties.';
COMMENT ON COLUMN assessment_social_and_functional.financial_difficulties IS
    'Whether the patient has financial difficulties: yes, no, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.housing_issues IS
    'Whether the patient has housing issues: yes, no, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.housing_details IS
    'Free-text details of housing issues.';
COMMENT ON COLUMN assessment_social_and_functional.caring_responsibilities IS
    'Whether the patient has caring responsibilities: yes, no, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.caring_details IS
    'Free-text details of caring responsibilities.';
COMMENT ON COLUMN assessment_social_and_functional.daily_functioning IS
    'Daily functioning level: independent, some-difficulty, significant-difficulty, dependent, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.hobbies_and_interests IS
    'Free-text description of hobbies and interests.';
COMMENT ON COLUMN assessment_social_and_functional.exercise_frequency IS
    'Exercise frequency: daily, several-per-week, weekly, rarely, never, or empty string.';
COMMENT ON COLUMN assessment_social_and_functional.social_functional_notes IS
    'Free-text clinician notes on social and functional assessment.';
