-- 03_assessment_demographics.sql
-- Demographics section of the ophthalmology assessment.

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
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',
    optometrist_name VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: personal details, GP, and optometrist information. One-to-one child of assessment.';
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
COMMENT ON COLUMN assessment_demographics.gp_name IS
    'Name of the patient general practitioner.';
COMMENT ON COLUMN assessment_demographics.gp_practice IS
    'Name of the GP practice.';
COMMENT ON COLUMN assessment_demographics.optometrist_name IS
    'Name of the referring optometrist if applicable.';
