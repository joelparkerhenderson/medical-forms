-- 03_assessment_demographics.sql
-- Demographics section of the attention deficit assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age INTEGER
        CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', 'other', '')),
    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    education_level VARCHAR(50) NOT NULL DEFAULT '',
    marital_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'partnered', '')),
    referring_clinician VARCHAR(255) NOT NULL DEFAULT '',
    referral_reason TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: patient demographics and referral context. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.age IS
    'Patient age in years, NULL if unanswered.';
COMMENT ON COLUMN assessment_demographics.sex IS
    'Patient sex: male, female, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient ethnicity.';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Patient current occupation.';
COMMENT ON COLUMN assessment_demographics.education_level IS
    'Highest level of education attained.';
COMMENT ON COLUMN assessment_demographics.marital_status IS
    'Marital status: single, married, divorced, widowed, partnered, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.referring_clinician IS
    'Name of the referring clinician.';
COMMENT ON COLUMN assessment_demographics.referral_reason IS
    'Reason for referral to ADHD assessment.';
