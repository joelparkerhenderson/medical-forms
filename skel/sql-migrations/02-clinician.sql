-- 01-clinician.sql
-- Clinician information.

CREATE TABLE clinician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    united_kingdom_nhs_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_clinician_updated_at
    BEFORE UPDATE ON clinician
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clinician IS
    'Clinician';
COMMENT ON COLUMN clinician.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN clinician.name IS
    'Clinician name.';
COMMENT ON COLUMN clinician.birth IS
    'Clinician birth date.';
COMMENT ON COLUMN clinician.united_kingdom_nhs_number IS
    'Clinician United Kingdom NHS number, unique per clinician.';
