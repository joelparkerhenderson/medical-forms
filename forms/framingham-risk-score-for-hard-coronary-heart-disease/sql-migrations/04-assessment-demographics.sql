-- 04_assessment_demographics.sql
-- Step 2: Demographics section of the Framingham Risk Score assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age INTEGER
        CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
    sex VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sex IN ('male', 'female', 'other', '')),
    ethnicity VARCHAR(50) NOT NULL DEFAULT '',
    height_cm NUMERIC(5,1)
        CHECK (height_cm IS NULL OR (height_cm >= 50 AND height_cm <= 300)),
    weight_kg NUMERIC(5,1)
        CHECK (weight_kg IS NULL OR (weight_kg >= 10 AND weight_kg <= 500)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Step 2 Demographics: age, sex, and body measurements for Framingham risk calculation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.age IS
    'Patient age in years (Framingham model valid for 30-79).';
COMMENT ON COLUMN assessment_demographics.sex IS
    'Patient sex (male or female used in Framingham coefficients).';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient ethnicity.';
COMMENT ON COLUMN assessment_demographics.height_cm IS
    'Patient height in centimetres.';
COMMENT ON COLUMN assessment_demographics.weight_kg IS
    'Patient weight in kilograms.';
