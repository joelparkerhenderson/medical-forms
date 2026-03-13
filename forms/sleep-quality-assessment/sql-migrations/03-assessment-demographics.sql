-- 03_assessment_demographics.sql
-- Demographics section of the sleep quality assessment.

CREATE TABLE assessment_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ethnicity VARCHAR(100) NOT NULL DEFAULT '',
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    shift_worker VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shift_worker IN ('yes', 'no', '')),
    shift_pattern VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (shift_pattern IN ('day', 'night', 'rotating', 'irregular', '')),
    referring_physician VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_demographics_updated_at
    BEFORE UPDATE ON assessment_demographics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_demographics IS
    'Demographics section: ethnicity, occupation, and shift work pattern. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_demographics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_demographics.ethnicity IS
    'Patient self-reported ethnicity.';
COMMENT ON COLUMN assessment_demographics.occupation IS
    'Patient current occupation.';
COMMENT ON COLUMN assessment_demographics.shift_worker IS
    'Whether patient is a shift worker (significant impact on sleep quality).';
COMMENT ON COLUMN assessment_demographics.shift_pattern IS
    'Shift work pattern: day, night, rotating, irregular, or empty string if unanswered.';
COMMENT ON COLUMN assessment_demographics.referring_physician IS
    'Name of the referring physician.';
COMMENT ON COLUMN assessment_demographics.referral_date IS
    'Date of referral for sleep assessment.';
