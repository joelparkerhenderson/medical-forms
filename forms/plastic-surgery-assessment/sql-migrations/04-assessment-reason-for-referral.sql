-- 04_assessment_reason_for_referral.sql
-- Reason for referral section of the plastic surgery assessment.

CREATE TABLE assessment_reason_for_referral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referral_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (referral_type IN ('reconstructive', 'aesthetic', 'trauma', 'burn', 'congenital', 'cancer', 'other', '')),
    referral_type_other TEXT NOT NULL DEFAULT '',
    urgency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (urgency IN ('elective', 'urgent', 'emergency', '')),
    primary_complaint TEXT NOT NULL DEFAULT '',
    affected_body_area VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (affected_body_area IN ('face', 'head-neck', 'breast', 'trunk', 'upper-limb', 'hand', 'lower-limb', 'genitalia', 'multiple', 'other', '')),
    affected_body_area_other TEXT NOT NULL DEFAULT '',
    laterality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (laterality IN ('left', 'right', 'bilateral', 'midline', 'n-a', '')),
    duration_of_condition VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (duration_of_condition IN ('acute', 'less-1-month', '1-6-months', '6-12-months', 'greater-12-months', 'congenital', '')),
    previous_consultations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_consultations IN ('yes', 'no', '')),
    previous_consultations_details TEXT NOT NULL DEFAULT '',
    referral_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_reason_for_referral_updated_at
    BEFORE UPDATE ON assessment_reason_for_referral
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_reason_for_referral IS
    'Reason for referral section: referral type, urgency, primary complaint, body area. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_reason_for_referral.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_reason_for_referral.referral_type IS
    'Type of referral: reconstructive, aesthetic, trauma, burn, congenital, cancer, other, or empty.';
COMMENT ON COLUMN assessment_reason_for_referral.urgency IS
    'Clinical urgency: elective, urgent, emergency, or empty.';
COMMENT ON COLUMN assessment_reason_for_referral.primary_complaint IS
    'Free-text description of the patient primary complaint.';
COMMENT ON COLUMN assessment_reason_for_referral.affected_body_area IS
    'Primary body area affected: face, head-neck, breast, trunk, upper-limb, hand, lower-limb, genitalia, multiple, other, or empty.';
COMMENT ON COLUMN assessment_reason_for_referral.laterality IS
    'Side affected: left, right, bilateral, midline, n-a, or empty.';
COMMENT ON COLUMN assessment_reason_for_referral.duration_of_condition IS
    'Duration of condition: acute, less-1-month, 1-6-months, 6-12-months, greater-12-months, congenital, or empty.';
COMMENT ON COLUMN assessment_reason_for_referral.previous_consultations IS
    'Whether the patient has had previous consultations for this condition: yes, no, or empty.';
COMMENT ON COLUMN assessment_reason_for_referral.previous_consultations_details IS
    'Details of previous consultations.';
COMMENT ON COLUMN assessment_reason_for_referral.referral_notes IS
    'Additional clinician notes on the referral.';
