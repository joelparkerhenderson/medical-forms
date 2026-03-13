-- 03_assessment_demographics.sql
-- Demographics section of the occupational therapy assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    first_name VARCHAR(255) NOT NULL DEFAULT '',
    last_name VARCHAR(255) NOT NULL DEFAULT '',
    date_of_birth DATE,
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', 'other', '')),
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    employer VARCHAR(255) NOT NULL DEFAULT '',
    living_situation VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (living_situation IN ('alone', 'with-family', 'with-partner', 'assisted-living', 'care-home', '')),
    primary_hand VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (primary_hand IN ('left', 'right', 'ambidextrous', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: personal details, occupation, and living situation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.first_name IS
    'Patient given name.';
COMMENT ON COLUMN assessment_demographics.last_name IS
    'Patient family name.';
COMMENT ON COLUMN assessment_demographics.date_of_birth IS
    'Patient date of birth.';
COMMENT ON COLUMN assessment_demographics.sex IS
    'Patient sex: male, female, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.phone IS
    'Contact telephone number.';
COMMENT ON COLUMN assessment_demographics.email IS
    'Contact email address.';
COMMENT ON COLUMN assessment_demographics.address IS
    'Full postal address.';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Current or most recent occupation.';
COMMENT ON COLUMN assessment_demographics.employer IS
    'Current or most recent employer.';
COMMENT ON COLUMN assessment_demographics.living_situation IS
    'Living arrangement: alone, with-family, with-partner, assisted-living, care-home, or empty.';
COMMENT ON COLUMN assessment_demographics.primary_hand IS
    'Dominant hand: left, right, ambidextrous, or empty string if unanswered.';
