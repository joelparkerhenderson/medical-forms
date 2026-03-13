-- 04_assessment_referral_information.sql
-- Referral information section of the occupational therapy assessment.

CREATE TABLE assessment_referral_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    referral_source VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (referral_source IN ('gp', 'consultant', 'self', 'employer', 'social-services', 'other', '')),
    referral_source_details TEXT NOT NULL DEFAULT '',
    referring_clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    referring_clinician_role VARCHAR(255) NOT NULL DEFAULT '',
    referral_date DATE,
    referral_reason TEXT NOT NULL DEFAULT '',
    primary_diagnosis TEXT NOT NULL DEFAULT '',
    secondary_diagnoses TEXT NOT NULL DEFAULT '',
    precautions TEXT NOT NULL DEFAULT '',
    previous_ot_involvement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_ot_involvement IN ('yes', 'no', '')),
    previous_ot_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_referral_information_updated_at
    BEFORE UPDATE ON assessment_referral_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_referral_information IS
    'Referral information section: source, reason, diagnosis, and prior OT history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_referral_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_referral_information.referral_source IS
    'Source of referral: gp, consultant, self, employer, social-services, other, or empty.';
COMMENT ON COLUMN assessment_referral_information.referral_source_details IS
    'Additional details about the referral source.';
COMMENT ON COLUMN assessment_referral_information.referring_clinician_name IS
    'Name of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referring_clinician_role IS
    'Role or specialty of the referring clinician.';
COMMENT ON COLUMN assessment_referral_information.referral_date IS
    'Date the referral was made.';
COMMENT ON COLUMN assessment_referral_information.referral_reason IS
    'Primary reason for referral to occupational therapy.';
COMMENT ON COLUMN assessment_referral_information.primary_diagnosis IS
    'Primary medical diagnosis prompting the referral.';
COMMENT ON COLUMN assessment_referral_information.secondary_diagnoses IS
    'Any additional relevant diagnoses.';
COMMENT ON COLUMN assessment_referral_information.precautions IS
    'Medical or safety precautions to observe during assessment.';
COMMENT ON COLUMN assessment_referral_information.previous_ot_involvement IS
    'Whether the patient has had previous occupational therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_referral_information.previous_ot_details IS
    'Details of any previous occupational therapy involvement.';
