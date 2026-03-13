-- 04_assessment_referral_information.sql
-- Referral information section of the mobility assessment.

CREATE TABLE assessment_referral_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referring_clinician VARCHAR(255) NOT NULL DEFAULT '',
    referring_organisation VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,
    referral_reason TEXT NOT NULL DEFAULT '',
    previous_mobility_assessment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mobility_assessment IN ('yes', 'no', '')),
    previous_assessment_date DATE,
    previous_tinetti_score INTEGER
        CHECK (previous_tinetti_score IS NULL OR (previous_tinetti_score >= 0 AND previous_tinetti_score <= 28)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_referral_information_updated_at
    BEFORE UPDATE ON assessment_referral_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_referral_information IS
    'Referral information section: referring clinician, reason, and prior mobility assessment history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_referral_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_referral_information.referring_clinician IS
    'Name of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referring_organisation IS
    'Organisation or practice of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referral_date IS
    'Date the referral was made.';
COMMENT ON COLUMN assessment_referral_information.referral_reason IS
    'Clinical reason for the referral.';
COMMENT ON COLUMN assessment_referral_information.previous_mobility_assessment IS
    'Whether the patient has had a prior mobility assessment: yes, no, or empty string.';
COMMENT ON COLUMN assessment_referral_information.previous_assessment_date IS
    'Date of the most recent prior mobility assessment, if applicable.';
COMMENT ON COLUMN assessment_referral_information.previous_tinetti_score IS
    'Tinetti score from the most recent prior assessment (0-28).';
