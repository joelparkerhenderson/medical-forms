-- 11_assessment_healthcare_professional_review.sql
-- Healthcare professional review section of the advance decision to refuse treatment.

CREATE TABLE assessment_healthcare_professional_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reviewed_by_healthcare_professional VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reviewed_by_healthcare_professional IN ('yes', 'no', '')),
    reviewer_name VARCHAR(255) NOT NULL DEFAULT '',
    reviewer_role VARCHAR(100) NOT NULL DEFAULT '',
    reviewer_registration_number VARCHAR(50) NOT NULL DEFAULT '',
    review_date DATE,
    reviewer_confirms_capacity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reviewer_confirms_capacity IN ('yes', 'no', '')),
    reviewer_confirms_informed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reviewer_confirms_informed IN ('yes', 'no', '')),
    clinical_notes TEXT NOT NULL DEFAULT '',
    concerns_raised TEXT NOT NULL DEFAULT '',
    reviewer_signature_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reviewer_signature_obtained IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_healthcare_professional_review_updated_at
    BEFORE UPDATE ON assessment_healthcare_professional_review
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_healthcare_professional_review IS
    'Healthcare professional review section: records clinical review of the advance decision for validity. While not legally required, clinical endorsement strengthens validity. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_healthcare_professional_review.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewed_by_healthcare_professional IS
    'Whether the advance decision has been reviewed by a healthcare professional.';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewer_name IS
    'Full name of the reviewing healthcare professional.';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewer_role IS
    'Professional role of the reviewer (e.g. GP, consultant, nurse).';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewer_registration_number IS
    'Professional registration number (e.g. GMC, NMC number).';
COMMENT ON COLUMN assessment_healthcare_professional_review.review_date IS
    'Date the clinical review was conducted, NULL if unanswered.';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewer_confirms_capacity IS
    'Whether the reviewer confirms the person had capacity at the time of making the decision.';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewer_confirms_informed IS
    'Whether the reviewer confirms the person was fully informed about the consequences.';
COMMENT ON COLUMN assessment_healthcare_professional_review.clinical_notes IS
    'Free-text clinical notes from the review.';
COMMENT ON COLUMN assessment_healthcare_professional_review.concerns_raised IS
    'Any concerns raised by the reviewer about the validity or appropriateness of the advance decision.';
COMMENT ON COLUMN assessment_healthcare_professional_review.reviewer_signature_obtained IS
    'Whether the reviewer provided their signature endorsing the advance decision.';
