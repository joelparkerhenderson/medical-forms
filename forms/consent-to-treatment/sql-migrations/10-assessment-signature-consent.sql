-- 10_assessment_signature_consent.sql
-- Signature and consent section of the consent to treatment form.

CREATE TABLE assessment_signature_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    patient_has_capacity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_has_capacity IN ('yes', 'no', '')),
    capacity_assessment_details TEXT NOT NULL DEFAULT '',
    consent_given_by VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (consent_given_by IN ('patient', 'parent', 'guardian', 'lpa', 'best-interest', '')),
    consent_given_by_name VARCHAR(255) NOT NULL DEFAULT '',
    consent_given_by_relationship VARCHAR(100) NOT NULL DEFAULT '',
    patient_signature_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_signature_obtained IN ('yes', 'no', '')),
    patient_signature_date DATE,
    patient_signature_time VARCHAR(10) NOT NULL DEFAULT '',
    clinician_signature_obtained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clinician_signature_obtained IN ('yes', 'no', '')),
    clinician_name VARCHAR(255) NOT NULL DEFAULT '',
    clinician_role VARCHAR(100) NOT NULL DEFAULT '',
    clinician_gmc_number VARCHAR(20) NOT NULL DEFAULT '',
    clinician_signature_date DATE,
    witness_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (witness_required IN ('yes', 'no', '')),
    witness_name VARCHAR(255) NOT NULL DEFAULT '',
    witness_role VARCHAR(100) NOT NULL DEFAULT '',
    witness_signature_date DATE,
    consent_form_copy_given VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (consent_form_copy_given IN ('yes', 'no', '')),
    signature_consent_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_signature_consent_updated_at
    BEFORE UPDATE ON assessment_signature_consent
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_signature_consent IS
    'Signature and consent section: capacity assessment, signatures from patient, clinician, and witness. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_signature_consent.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_signature_consent.patient_has_capacity IS
    'Whether the patient has mental capacity to consent: yes, no, or empty.';
COMMENT ON COLUMN assessment_signature_consent.capacity_assessment_details IS
    'Details of mental capacity assessment if conducted.';
COMMENT ON COLUMN assessment_signature_consent.consent_given_by IS
    'Who is providing consent: patient, parent, guardian, lpa (lasting power of attorney), best-interest, or empty.';
COMMENT ON COLUMN assessment_signature_consent.consent_given_by_name IS
    'Name of the person providing consent if not the patient.';
COMMENT ON COLUMN assessment_signature_consent.consent_given_by_relationship IS
    'Relationship of the person providing consent to the patient.';
COMMENT ON COLUMN assessment_signature_consent.patient_signature_obtained IS
    'Whether the patient (or representative) signature was obtained: yes, no, or empty.';
COMMENT ON COLUMN assessment_signature_consent.patient_signature_date IS
    'Date the patient (or representative) signed.';
COMMENT ON COLUMN assessment_signature_consent.patient_signature_time IS
    'Time the patient (or representative) signed (HH:MM format).';
COMMENT ON COLUMN assessment_signature_consent.clinician_signature_obtained IS
    'Whether the clinician signature was obtained: yes, no, or empty.';
COMMENT ON COLUMN assessment_signature_consent.clinician_name IS
    'Name of the clinician who obtained consent.';
COMMENT ON COLUMN assessment_signature_consent.clinician_role IS
    'Role or grade of the clinician who obtained consent.';
COMMENT ON COLUMN assessment_signature_consent.clinician_gmc_number IS
    'GMC registration number of the clinician.';
COMMENT ON COLUMN assessment_signature_consent.clinician_signature_date IS
    'Date the clinician signed.';
COMMENT ON COLUMN assessment_signature_consent.witness_required IS
    'Whether a witness signature is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_signature_consent.witness_name IS
    'Name of the witness.';
COMMENT ON COLUMN assessment_signature_consent.witness_role IS
    'Role of the witness.';
COMMENT ON COLUMN assessment_signature_consent.witness_signature_date IS
    'Date the witness signed.';
COMMENT ON COLUMN assessment_signature_consent.consent_form_copy_given IS
    'Whether a copy of the consent form was given to the patient: yes, no, or empty.';
COMMENT ON COLUMN assessment_signature_consent.signature_consent_notes IS
    'Additional clinician notes on signature and consent.';
