--liquibase formatted sql

--changeset author:1
CREATE TABLE clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    nhs_employee_number VARCHAR(20) UNIQUE,
    phone VARCHAR(30) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_clinician_updated_at
    BEFORE UPDATE ON clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinician IS
    'Clinician demographic information for prescription requests.';
COMMENT ON COLUMN clinician.id IS 'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinician.first_name IS 'Clinician given name.';
COMMENT ON COLUMN clinician.last_name IS 'Clinician family name.';
COMMENT ON COLUMN clinician.nhs_employee_number IS 'NHS employee number, unique per clinician.';
COMMENT ON COLUMN clinician.phone IS 'Clinician phone number.';
COMMENT ON COLUMN clinician.email IS 'Clinician email address.';
--rollback DROP TABLE clinician;
