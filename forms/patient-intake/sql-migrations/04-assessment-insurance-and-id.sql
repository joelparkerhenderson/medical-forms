-- 04_assessment_insurance_and_id.sql
-- Insurance and identification section of the patient intake assessment.

CREATE TABLE assessment_insurance_and_id (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nhs_number VARCHAR(20) NOT NULL DEFAULT '',
    hospital_number VARCHAR(50) NOT NULL DEFAULT '',
    gp_name VARCHAR(255) NOT NULL DEFAULT '',
    gp_practice VARCHAR(255) NOT NULL DEFAULT '',
    gp_address TEXT NOT NULL DEFAULT '',
    gp_phone VARCHAR(50) NOT NULL DEFAULT '',
    has_private_insurance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_private_insurance IN ('yes', 'no', '')),
    insurance_provider VARCHAR(255) NOT NULL DEFAULT '',
    insurance_policy_number VARCHAR(100) NOT NULL DEFAULT '',
    insurance_group_number VARCHAR(100) NOT NULL DEFAULT '',
    insurance_phone VARCHAR(50) NOT NULL DEFAULT '',
    photo_id_verified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (photo_id_verified IN ('yes', 'no', '')),
    photo_id_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (photo_id_type IN ('passport', 'driving-licence', 'national-id', 'other', '')),
    insurance_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_insurance_and_id_updated_at
    BEFORE UPDATE ON assessment_insurance_and_id
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_insurance_and_id IS
    'Insurance and identification section: NHS number, GP details, private insurance, and identity verification. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_insurance_and_id.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_insurance_and_id.nhs_number IS
    'NHS number for the patient.';
COMMENT ON COLUMN assessment_insurance_and_id.hospital_number IS
    'Hospital patient number.';
COMMENT ON COLUMN assessment_insurance_and_id.gp_name IS
    'Name of the patient general practitioner.';
COMMENT ON COLUMN assessment_insurance_and_id.gp_practice IS
    'Name of the GP practice.';
COMMENT ON COLUMN assessment_insurance_and_id.gp_address IS
    'Address of the GP practice.';
COMMENT ON COLUMN assessment_insurance_and_id.gp_phone IS
    'Telephone number of the GP practice.';
COMMENT ON COLUMN assessment_insurance_and_id.has_private_insurance IS
    'Whether the patient has private health insurance: yes, no, or empty.';
COMMENT ON COLUMN assessment_insurance_and_id.insurance_provider IS
    'Name of the private insurance provider.';
COMMENT ON COLUMN assessment_insurance_and_id.insurance_policy_number IS
    'Insurance policy number.';
COMMENT ON COLUMN assessment_insurance_and_id.insurance_group_number IS
    'Insurance group number if applicable.';
COMMENT ON COLUMN assessment_insurance_and_id.insurance_phone IS
    'Insurance provider contact telephone.';
COMMENT ON COLUMN assessment_insurance_and_id.photo_id_verified IS
    'Whether photo identification has been verified: yes, no, or empty.';
COMMENT ON COLUMN assessment_insurance_and_id.photo_id_type IS
    'Type of photo ID: passport, driving-licence, national-id, other, or empty.';
COMMENT ON COLUMN assessment_insurance_and_id.insurance_notes IS
    'Additional notes on insurance and identification.';
