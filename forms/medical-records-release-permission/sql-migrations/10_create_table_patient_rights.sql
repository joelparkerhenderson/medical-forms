CREATE TABLE patient_rights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    acknowledged_right_to_revoke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (acknowledged_right_to_revoke IN ('yes', 'no', '')),
    acknowledged_no_charge_for_access VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (acknowledged_no_charge_for_access IN ('yes', 'no', '')),
    acknowledged_data_protection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (acknowledged_data_protection IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_patient_rights_updated_at
    BEFORE UPDATE ON patient_rights
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE patient_rights IS
    'Patient acknowledgements of rights regarding records release. One-to-one child of release_form.';
COMMENT ON COLUMN patient_rights.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN patient_rights.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN patient_rights.acknowledged_right_to_revoke IS
    'Patient acknowledged their right to revoke consent: yes, no, or empty string.';
COMMENT ON COLUMN patient_rights.acknowledged_no_charge_for_access IS
    'Patient acknowledged no charge for access to records: yes, no, or empty string.';
COMMENT ON COLUMN patient_rights.acknowledged_data_protection IS
    'Patient acknowledged data protection rights: yes, no, or empty string.';

COMMENT ON COLUMN patient_rights.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN patient_rights.updated_at IS
    'Timestamp when this row was last updated.';
