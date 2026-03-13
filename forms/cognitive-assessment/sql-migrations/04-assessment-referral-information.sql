-- 04_assessment_referral_information.sql
-- Referral information section of the cognitive assessment.

CREATE TABLE assessment_referral_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referrer_name VARCHAR(255) NOT NULL DEFAULT '',
    referrer_role VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,
    reason_for_referral TEXT NOT NULL DEFAULT '',
    presenting_complaint TEXT NOT NULL DEFAULT '',
    symptom_duration_months INTEGER
        CHECK (symptom_duration_months IS NULL OR symptom_duration_months >= 0),
    symptom_onset VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (symptom_onset IN ('gradual', 'sudden', 'stepwise', 'fluctuating', '')),
    informant_name VARCHAR(255) NOT NULL DEFAULT '',
    informant_relationship VARCHAR(50) NOT NULL DEFAULT '',
    informant_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (informant_available IN ('yes', 'no', '')),
    referral_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_referral_information_updated_at
    BEFORE UPDATE ON assessment_referral_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_referral_information IS
    'Referral information section: referrer details, presenting complaint, symptom history, and informant. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_referral_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_referral_information.referrer_name IS
    'Name of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referrer_role IS
    'Role or title of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referral_date IS
    'Date the referral was made.';
COMMENT ON COLUMN assessment_referral_information.reason_for_referral IS
    'Primary reason for the cognitive assessment referral.';
COMMENT ON COLUMN assessment_referral_information.presenting_complaint IS
    'Description of the presenting cognitive complaint.';
COMMENT ON COLUMN assessment_referral_information.symptom_duration_months IS
    'Duration of cognitive symptoms in months.';
COMMENT ON COLUMN assessment_referral_information.symptom_onset IS
    'Pattern of symptom onset: gradual, sudden, stepwise, fluctuating, or empty.';
COMMENT ON COLUMN assessment_referral_information.informant_name IS
    'Name of the collateral informant (family member or carer).';
COMMENT ON COLUMN assessment_referral_information.informant_relationship IS
    'Relationship of informant to the patient (e.g. spouse, child, carer).';
COMMENT ON COLUMN assessment_referral_information.informant_available IS
    'Whether a collateral informant is available: yes, no, or empty.';
COMMENT ON COLUMN assessment_referral_information.referral_notes IS
    'Additional clinician notes on the referral.';
