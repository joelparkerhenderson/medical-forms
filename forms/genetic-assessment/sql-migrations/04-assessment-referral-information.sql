-- 04_assessment_referral_information.sql
-- Referral information section of the genetic assessment.

CREATE TABLE assessment_referral_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referring_clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    referring_clinician_role VARCHAR(255) NOT NULL DEFAULT '',
    referring_organisation VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,
    referral_reason TEXT NOT NULL DEFAULT '',
    referral_urgency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (referral_urgency IN ('routine', 'urgent', 'two-week-wait', '')),
    specialty_referred_to VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (specialty_referred_to IN ('cancer-genetics', 'cardiovascular-genetics', 'neurogenetics', 'reproductive-genetics', 'general', '')),
    previous_genetic_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_genetic_referral IN ('yes', 'no', '')),
    previous_referral_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_referral_information_updated_at
    BEFORE UPDATE ON assessment_referral_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_referral_information IS
    'Referral information section: referring clinician, urgency, and specialty. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_referral_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_referral_information.referring_clinician_name IS
    'Full name of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referring_clinician_role IS
    'Role or title of the referring clinician (e.g. GP, consultant).';
COMMENT ON COLUMN assessment_referral_information.referring_organisation IS
    'Organisation or hospital making the referral.';
COMMENT ON COLUMN assessment_referral_information.referral_date IS
    'Date of the referral, NULL if unanswered.';
COMMENT ON COLUMN assessment_referral_information.referral_reason IS
    'Free-text reason for the genetic counselling referral.';
COMMENT ON COLUMN assessment_referral_information.referral_urgency IS
    'Urgency of the referral: routine, urgent, two-week-wait, or empty string.';
COMMENT ON COLUMN assessment_referral_information.specialty_referred_to IS
    'Genetics specialty: cancer-genetics, cardiovascular-genetics, neurogenetics, reproductive-genetics, general, or empty string.';
COMMENT ON COLUMN assessment_referral_information.previous_genetic_referral IS
    'Whether the patient has had a previous genetic referral: yes, no, or empty string.';
COMMENT ON COLUMN assessment_referral_information.previous_referral_details IS
    'Details of any previous genetic referral.';
