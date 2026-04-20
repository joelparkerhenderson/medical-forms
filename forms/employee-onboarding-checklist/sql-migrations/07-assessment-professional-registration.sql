-- 07_assessment_professional_registration.sql
-- Professional registration section of the onboarding assessment.

CREATE TABLE assessment_professional_registration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    registration_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (registration_required IN ('yes', 'no', '')),
    regulatory_body VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (regulatory_body IN ('nmc', 'gmc', 'hcpc', 'gdc', 'gphc', 'other', '')),
    regulatory_body_other VARCHAR(255) NOT NULL DEFAULT '',
    registration_number VARCHAR(50) NOT NULL DEFAULT '',
    registration_verified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (registration_verified IN ('yes', 'no', '')),
    registration_expiry_date DATE,
    registration_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (registration_conditions IN ('yes', 'no', '')),
    registration_condition_details TEXT NOT NULL DEFAULT '',
    revalidation_date DATE,
    indemnity_insurance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (indemnity_insurance IN ('yes', 'no', 'na', '')),
    professional_registration_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_professional_registration_updated_at
    BEFORE UPDATE ON assessment_professional_registration
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_professional_registration IS
    'Professional registration section: regulatory body, registration number, revalidation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_professional_registration.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_professional_registration.registration_required IS
    'Whether professional registration is required for this role: yes, no, or empty.';
COMMENT ON COLUMN assessment_professional_registration.regulatory_body IS
    'Regulatory body: nmc, gmc, hcpc, gdc, gphc, other, or empty.';
COMMENT ON COLUMN assessment_professional_registration.regulatory_body_other IS
    'Name of other regulatory body if not in the standard list.';
COMMENT ON COLUMN assessment_professional_registration.registration_number IS
    'Professional registration number.';
COMMENT ON COLUMN assessment_professional_registration.registration_verified IS
    'Whether the registration has been verified online: yes, no, or empty.';
COMMENT ON COLUMN assessment_professional_registration.registration_expiry_date IS
    'Date the professional registration expires.';
COMMENT ON COLUMN assessment_professional_registration.registration_conditions IS
    'Whether there are conditions on the registration: yes, no, or empty.';
COMMENT ON COLUMN assessment_professional_registration.registration_condition_details IS
    'Details of any conditions on the professional registration.';
COMMENT ON COLUMN assessment_professional_registration.revalidation_date IS
    'Next revalidation due date.';
COMMENT ON COLUMN assessment_professional_registration.indemnity_insurance IS
    'Whether professional indemnity insurance is in place: yes, no, na, or empty.';
COMMENT ON COLUMN assessment_professional_registration.professional_registration_notes IS
    'Additional notes on professional registration.';
