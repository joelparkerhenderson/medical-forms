-- 01-clinician.sql
-- Clinician information.

CREATE TABLE clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '' CHECK (clinician_role IN ( 'anaesthetist', 'surgeon', 'preop-nurse', 'perioperative-physician', 'geriatrician', 'pharmacist', 'other', '' )),
    registration_body TEXT NOT NULL DEFAULT '' CHECK (registration_body IN ('GMC', 'NMC', 'HCPC', 'GPhC', 'other', '')),
    registration_number TEXT NOT NULL DEFAULT '',
    united_kingdom_nhs_number CHAR(12) UNIQUE,
);

CREATE TRIGGER trg_clinician_updated_at
    BEFORE UPDATE ON clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinician IS
    'Clinician';
COMMENT ON COLUMN clinician.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinician.created_at IS
    'Timestamp when the record was created.';
COMMENT ON COLUMN clinician.updated_at IS
    'Timestamp when the record was updated most-recently.';
COMMENT ON COLUMN clinician.name IS
    'Clinician name.';
COMMENT ON COLUMN clinician.role IS
    'Clinician role.';
COMMENT ON COLUMN clinician.registration_body IS
    'Clinician registration body.';
COMMENT ON COLUMN clinician.registration_number IS
    'Clinician registration number.';
COMMENT ON COLUMN clinician.united_kingdom_nhs_number IS
    'Clinician United Kingdom NHS number, unique per person.';

