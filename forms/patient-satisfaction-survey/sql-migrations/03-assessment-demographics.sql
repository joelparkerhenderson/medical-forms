-- 03_assessment_demographics.sql
-- Demographics section of the patient satisfaction survey.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_name VARCHAR(255) NOT NULL DEFAULT '',
    gender_identity VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (gender_identity IN ('male', 'female', 'non-binary', 'other', '')),
    age_range VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75-plus', '')),
    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    preferred_language VARCHAR(100) NOT NULL DEFAULT '',
    interpreter_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (interpreter_required IN ('yes', 'no', '')),
    postcode_area VARCHAR(10) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: identity, age range, language, and location details. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.preferred_name IS
    'Name the patient prefers to be called.';
COMMENT ON COLUMN assessment_demographics.gender_identity IS
    'Patient gender identity: male, female, non-binary, other, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.age_range IS
    'Patient age range bracket.';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient ethnic background.';
COMMENT ON COLUMN assessment_demographics.preferred_language IS
    'Primary language spoken by the patient.';
COMMENT ON COLUMN assessment_demographics.interpreter_required IS
    'Whether an interpreter is needed: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.postcode_area IS
    'First part of UK postcode for geographic analysis.';
