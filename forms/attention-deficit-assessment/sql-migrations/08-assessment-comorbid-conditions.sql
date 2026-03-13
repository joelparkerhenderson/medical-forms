-- 08_assessment_comorbid_conditions.sql
-- Comorbid conditions section of the attention deficit assessment.

CREATE TABLE assessment_comorbid_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_anxiety IN ('yes', 'no', '')),
    has_depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_depression IN ('yes', 'no', '')),
    has_bipolar_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_bipolar_disorder IN ('yes', 'no', '')),
    has_autism_spectrum VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autism_spectrum IN ('yes', 'no', '')),
    has_learning_disability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_learning_disability IN ('yes', 'no', '')),
    has_substance_use_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_substance_use_disorder IN ('yes', 'no', '')),
    substance_use_details TEXT NOT NULL DEFAULT '',
    has_sleep_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_sleep_disorder IN ('yes', 'no', '')),
    sleep_disorder_details TEXT NOT NULL DEFAULT '',
    has_personality_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_personality_disorder IN ('yes', 'no', '')),
    has_eating_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_eating_disorder IN ('yes', 'no', '')),
    has_tic_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_tic_disorder IN ('yes', 'no', '')),
    other_comorbidities TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comorbid_conditions_updated_at
    BEFORE UPDATE ON assessment_comorbid_conditions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comorbid_conditions IS
    'Comorbid conditions section: psychiatric and neurodevelopmental conditions commonly co-occurring with ADHD. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comorbid_conditions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_comorbid_conditions.has_anxiety IS
    'Whether the patient has anxiety disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_depression IS
    'Whether the patient has depression.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_bipolar_disorder IS
    'Whether the patient has bipolar disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_autism_spectrum IS
    'Whether the patient has autism spectrum disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_learning_disability IS
    'Whether the patient has a specific learning disability (e.g. dyslexia, dyscalculia).';
COMMENT ON COLUMN assessment_comorbid_conditions.has_substance_use_disorder IS
    'Whether the patient has a substance use disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.substance_use_details IS
    'Details of substance use (type, frequency, duration).';
COMMENT ON COLUMN assessment_comorbid_conditions.has_sleep_disorder IS
    'Whether the patient has a sleep disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.sleep_disorder_details IS
    'Details of sleep disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_personality_disorder IS
    'Whether the patient has a personality disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_eating_disorder IS
    'Whether the patient has an eating disorder.';
COMMENT ON COLUMN assessment_comorbid_conditions.has_tic_disorder IS
    'Whether the patient has a tic disorder or Tourette syndrome.';
COMMENT ON COLUMN assessment_comorbid_conditions.other_comorbidities IS
    'Free-text list of other relevant comorbid conditions.';
