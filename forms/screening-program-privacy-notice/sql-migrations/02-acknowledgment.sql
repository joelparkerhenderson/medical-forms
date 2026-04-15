-- liquibase formatted sql

-- changeset screening-program-privacy-notice:02-acknowledgment

CREATE TABLE acknowledgment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    full_name TEXT NOT NULL DEFAULT '',
    acknowledged_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_acknowledgment_updated_at
    BEFORE UPDATE ON acknowledgment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE acknowledgment IS 'Patient acknowledgment of the screening program privacy notice.';
COMMENT ON COLUMN acknowledgment.id IS 'Unique identifier for the acknowledgment (UUID).';
COMMENT ON COLUMN acknowledgment.patient_id IS 'Foreign key referencing the patient who acknowledged the notice.';
COMMENT ON COLUMN acknowledgment.confirmed IS 'Whether the patient confirmed they have read and understood the privacy notice.';
COMMENT ON COLUMN acknowledgment.full_name IS 'Full name typed by the patient as their acknowledgment signature.';
COMMENT ON COLUMN acknowledgment.acknowledged_date IS 'Date the patient acknowledged the privacy notice.';
COMMENT ON COLUMN acknowledgment.created_at IS 'Timestamp when the record was created.';
COMMENT ON COLUMN acknowledgment.updated_at IS 'Timestamp when the record was last updated.';
