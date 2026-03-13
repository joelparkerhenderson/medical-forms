-- 12_assessment_functional_and_social.sql
-- Functional and social section of the neurology assessment.

CREATE TABLE assessment_functional_and_social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    modified_rankin_score INTEGER
        CHECK (modified_rankin_score IS NULL OR (modified_rankin_score >= 0 AND modified_rankin_score <= 6)),
    barthel_index INTEGER
        CHECK (barthel_index IS NULL OR (barthel_index >= 0 AND barthel_index <= 100)),
    daily_functioning VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (daily_functioning IN ('independent', 'some-difficulty', 'significant-difficulty', 'dependent', '')),
    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'retired', 'student', 'sick-leave', 'disability', '')),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('driving', 'not-driving', 'dvla-notified', 'licence-revoked', '')),
    mobility_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mobility_level IN ('independent', 'walking-aid', 'wheelchair', 'bed-bound', '')),
    social_support VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_support IN ('strong', 'moderate', 'limited', 'none', '')),
    carer_support VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_support IN ('yes', 'no', '')),
    carer_details TEXT NOT NULL DEFAULT '',
    mood_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mood_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    quality_of_life_score INTEGER
        CHECK (quality_of_life_score IS NULL OR (quality_of_life_score >= 1 AND quality_of_life_score <= 10)),
    rehabilitation_needs TEXT NOT NULL DEFAULT '',
    functional_social_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_and_social_updated_at
    BEFORE UPDATE ON assessment_functional_and_social
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_and_social IS
    'Functional and social section: modified Rankin Scale, Barthel Index, driving, employment, and quality of life. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_and_social.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_and_social.modified_rankin_score IS
    'Modified Rankin Scale score (0 = no symptoms, 1 = no significant disability, 2 = slight disability, 3 = moderate disability, 4 = moderately severe disability, 5 = severe disability, 6 = dead).';
COMMENT ON COLUMN assessment_functional_and_social.barthel_index IS
    'Barthel Index of activities of daily living (0-100). Higher = more independent.';
COMMENT ON COLUMN assessment_functional_and_social.daily_functioning IS
    'Daily functioning level: independent, some-difficulty, significant-difficulty, dependent, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.employment_status IS
    'Employment status: employed, unemployed, retired, student, sick-leave, disability, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.driving_status IS
    'Driving status: driving, not-driving, dvla-notified, licence-revoked, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.mobility_level IS
    'Mobility level: independent, walking-aid, wheelchair, bed-bound, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.social_support IS
    'Level of social support: strong, moderate, limited, none, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.carer_support IS
    'Whether the patient receives carer support: yes, no, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.carer_details IS
    'Free-text details of carer support (frequency, type).';
COMMENT ON COLUMN assessment_functional_and_social.mood_impact IS
    'Impact of neurological condition on mood: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_functional_and_social.quality_of_life_score IS
    'Self-reported quality of life from 1 (very poor) to 10 (excellent).';
COMMENT ON COLUMN assessment_functional_and_social.rehabilitation_needs IS
    'Free-text description of rehabilitation needs (physiotherapy, occupational therapy, speech therapy).';
COMMENT ON COLUMN assessment_functional_and_social.functional_social_notes IS
    'Free-text clinician notes on functional and social assessment.';
