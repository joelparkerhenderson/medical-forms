-- 12_assessment_eligibility_allocation.sql
-- Eligibility and allocation decision section of the organ donation assessment.

CREATE TABLE assessment_eligibility_allocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    eligibility VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (eligibility IN ('suitable', 'conditionally-suitable', 'unsuitable', '')),
    expanded_criteria_donor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (expanded_criteria_donor IN ('yes', 'no', '')),
    organs_approved TEXT NOT NULL DEFAULT '',
    organs_declined TEXT NOT NULL DEFAULT '',
    decline_reason TEXT NOT NULL DEFAULT '',
    nhsbt_referral_made VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nhsbt_referral_made IN ('yes', 'no', '')),
    nhsbt_reference VARCHAR(100) NOT NULL DEFAULT '',
    allocation_priority VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (allocation_priority IN ('super-urgent', 'urgent', 'routine', '')),
    lead_clinician VARCHAR(255) NOT NULL DEFAULT '',
    decision_date DATE,
    decision_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_eligibility_allocation_updated_at
    BEFORE UPDATE ON assessment_eligibility_allocation
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_eligibility_allocation IS
    'Eligibility and allocation decision section: final eligibility, organ approval, NHSBT referral. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_eligibility_allocation.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_eligibility_allocation.eligibility IS
    'Overall eligibility: suitable, conditionally-suitable, unsuitable, or empty.';
COMMENT ON COLUMN assessment_eligibility_allocation.expanded_criteria_donor IS
    'Whether donor meets expanded criteria: yes, no, or empty.';
COMMENT ON COLUMN assessment_eligibility_allocation.organs_approved IS
    'Organs approved for donation.';
COMMENT ON COLUMN assessment_eligibility_allocation.organs_declined IS
    'Organs declined for donation.';
COMMENT ON COLUMN assessment_eligibility_allocation.decline_reason IS
    'Reason for declining specific organs.';
COMMENT ON COLUMN assessment_eligibility_allocation.nhsbt_referral_made IS
    'Whether referral to NHS Blood and Transplant has been made: yes, no, or empty.';
COMMENT ON COLUMN assessment_eligibility_allocation.nhsbt_reference IS
    'NHSBT referral reference number.';
COMMENT ON COLUMN assessment_eligibility_allocation.allocation_priority IS
    'Allocation priority: super-urgent, urgent, routine, or empty.';
COMMENT ON COLUMN assessment_eligibility_allocation.lead_clinician IS
    'Name of the lead clinician making the decision.';
COMMENT ON COLUMN assessment_eligibility_allocation.decision_date IS
    'Date of the eligibility decision.';
COMMENT ON COLUMN assessment_eligibility_allocation.decision_notes IS
    'Additional notes on the eligibility and allocation decision.';
