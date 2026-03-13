-- 04_assessment_referral_information.sql
-- Referral information section of the kinesiology assessment.

CREATE TABLE assessment_referral_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referring_clinician VARCHAR(255) NOT NULL DEFAULT '',
    referring_organisation VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,
    referral_reason TEXT NOT NULL DEFAULT '',
    previous_fms_assessment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_fms_assessment IN ('yes', 'no', '')),
    previous_fms_date DATE,
    previous_fms_score INTEGER
        CHECK (previous_fms_score IS NULL OR (previous_fms_score >= 0 AND previous_fms_score <= 21)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_referral_information_updated_at
    BEFORE UPDATE ON assessment_referral_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_referral_information IS
    'Referral information section: referring clinician, reason, and previous FMS history. One-to-one child of assessment.';
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
COMMENT ON COLUMN assessment_referral_information.previous_fms_assessment IS
    'Whether the patient has had a prior FMS assessment: yes, no, or empty string.';
COMMENT ON COLUMN assessment_referral_information.previous_fms_date IS
    'Date of the most recent prior FMS assessment, if applicable.';
COMMENT ON COLUMN assessment_referral_information.previous_fms_score IS
    'Total FMS score from the most recent prior assessment (0-21).';
