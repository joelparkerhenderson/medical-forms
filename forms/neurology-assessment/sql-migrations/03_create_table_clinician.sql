CREATE TABLE clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT ''
        CHECK (role IN (
            'anaesthetist', 'surgeon', 'preop-nurse',
            'perioperative-physician', 'geriatrician', 'pharmacist',
            'gp', 'nurse', 'physiotherapist', 'other', ''
        )),
    registration_body TEXT NOT NULL DEFAULT ''
        CHECK (registration_body IN ('GMC', 'NMC', 'HCPC', 'GPhC', 'other', '')),
    registration_number TEXT NOT NULL DEFAULT '',
    united_kingdom_nhs_number CHAR(12) UNIQUE
);

CREATE TRIGGER trg_clinician_updated_at
    BEFORE UPDATE ON clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinician IS
    'Clinician who operated or authored this record.';
COMMENT ON COLUMN clinician.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinician.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN clinician.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN clinician.deleted_at IS
    'Soft-delete timestamp; NULL when the row is live.';
COMMENT ON COLUMN clinician.name IS
    'Clinician name.';
COMMENT ON COLUMN clinician.role IS
    'Clinician role.';
COMMENT ON COLUMN clinician.registration_body IS
    'Professional registration body.';
COMMENT ON COLUMN clinician.registration_number IS
    'Registration number with the regulator.';
COMMENT ON COLUMN clinician.united_kingdom_nhs_number IS
    'Clinician UK NHS number, unique per person.';
