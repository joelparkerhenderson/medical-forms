-- 03_assessment_demographics.sql
-- Demographics section of the rheumatology assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    referring_physician VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,
    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('current', 'former', 'never', '')),
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'occasional', 'moderate', 'heavy', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: ethnicity, occupation, referral details, and lifestyle factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient self-reported ethnicity.';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Patient current occupation.';
COMMENT ON COLUMN assessment_demographics.referring_physician IS
    'Name of the referring physician.';
COMMENT ON COLUMN assessment_demographics.referral_date IS
    'Date of referral to rheumatology.';
COMMENT ON COLUMN assessment_demographics.smoking_status IS
    'Smoking status: current, former, never, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.alcohol_use IS
    'Alcohol consumption level: none, occasional, moderate, heavy, or empty string if unanswered.';
