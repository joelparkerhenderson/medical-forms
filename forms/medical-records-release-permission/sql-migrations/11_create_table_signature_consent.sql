CREATE TABLE signature_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,
    patient_signature_confirmed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_signature_confirmed IN ('yes', 'no', '')),
    signature_date DATE,
    witness_name VARCHAR(255) NOT NULL DEFAULT '',
    witness_signature_confirmed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (witness_signature_confirmed IN ('yes', 'no', '')),
    witness_date DATE,
    parent_guardian_name VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_signature_consent_updated_at
    BEFORE UPDATE ON signature_consent
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE signature_consent IS
    'Signature and consent confirmations for the release form. One-to-one child of release_form.';
COMMENT ON COLUMN signature_consent.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN signature_consent.patient_signature_confirmed IS
    'Whether the patient has confirmed their signature: yes, no, or empty string.';
COMMENT ON COLUMN signature_consent.signature_date IS
    'Date the patient signed the consent form.';
COMMENT ON COLUMN signature_consent.witness_name IS
    'Full name of the witness.';
COMMENT ON COLUMN signature_consent.witness_signature_confirmed IS
    'Whether the witness has confirmed their signature: yes, no, or empty string.';
COMMENT ON COLUMN signature_consent.witness_date IS
    'Date the witness signed.';
COMMENT ON COLUMN signature_consent.parent_guardian_name IS
    'Name of parent or guardian if patient is a minor or lacks capacity.';

COMMENT ON COLUMN signature_consent.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN signature_consent.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN signature_consent.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN signature_consent.deleted_at IS
    'Timestamp when this row was deleted.';
