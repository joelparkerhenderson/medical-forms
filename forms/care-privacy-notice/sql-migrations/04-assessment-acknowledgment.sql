-- 04_assessment_acknowledgment.sql
-- Patient acknowledgment of the privacy notice.

CREATE TABLE assessment_acknowledgment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    agreed BOOLEAN NOT NULL DEFAULT FALSE,
    patient_typed_full_name VARCHAR(255) NOT NULL DEFAULT '',
    patient_typed_date DATE,
    acknowledged_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_acknowledgment_updated_at
    BEFORE UPDATE ON assessment_acknowledgment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_acknowledgment IS
    'Patient acknowledgment record for the care privacy notice. Stores the checkbox state, typed name, and typed date.';
COMMENT ON COLUMN assessment_acknowledgment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_acknowledgment.agreed IS
    'Whether the patient checked the acknowledgment checkbox.';
COMMENT ON COLUMN assessment_acknowledgment.patient_typed_full_name IS
    'Full name as typed by the patient for acknowledgment.';
COMMENT ON COLUMN assessment_acknowledgment.patient_typed_date IS
    'Date as typed by the patient for acknowledgment.';
COMMENT ON COLUMN assessment_acknowledgment.acknowledged_at IS
    'Timestamp when the acknowledgment was submitted.';
