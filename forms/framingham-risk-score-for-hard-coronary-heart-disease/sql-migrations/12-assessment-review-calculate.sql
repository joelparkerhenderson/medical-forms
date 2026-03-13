-- 12_assessment_review_calculate.sql
-- Step 10: Review and calculate section of the Framingham Risk Score assessment.

CREATE TABLE assessment_review_calculate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    review_date DATE,
    clinical_notes TEXT NOT NULL DEFAULT '',
    patient_consent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_consent IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_review_calculate_updated_at
    BEFORE UPDATE ON assessment_review_calculate
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_review_calculate IS
    'Step 10 Review & Calculate: clinician review, consent, and notes before risk calculation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_review_calculate.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_review_calculate.clinician_name IS
    'Name of the reviewing clinician.';
COMMENT ON COLUMN assessment_review_calculate.review_date IS
    'Date of the clinical review, NULL if unanswered.';
COMMENT ON COLUMN assessment_review_calculate.clinical_notes IS
    'Additional clinical notes and observations.';
COMMENT ON COLUMN assessment_review_calculate.patient_consent IS
    'Whether the patient has consented to the assessment and risk calculation.';
