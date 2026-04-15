-- 04-acknowledgment.sql
-- Patient acknowledgment of the care privacy notice. One-to-one child of assessment.

CREATE TABLE acknowledgment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    practice_configuration_id UUID NOT NULL
        REFERENCES practice_configuration(id) ON DELETE RESTRICT,

    agreed BOOLEAN NOT NULL DEFAULT false,
    patient_typed_full_name VARCHAR(255) NOT NULL DEFAULT '',
    patient_typed_date DATE,
    acknowledged_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_acknowledgment_updated_at
    BEFORE UPDATE ON acknowledgment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE acknowledgment IS
    'Patient acknowledgment of the care privacy notice. One-to-one child of assessment.';
COMMENT ON COLUMN acknowledgment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN acknowledgment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1 relationship).';
COMMENT ON COLUMN acknowledgment.practice_configuration_id IS
    'Foreign key to the practice configuration in effect when the notice was presented.';
COMMENT ON COLUMN acknowledgment.agreed IS
    'Whether the patient has agreed to the privacy notice. Defaults to false.';
COMMENT ON COLUMN acknowledgment.patient_typed_full_name IS
    'Full name typed by the patient as a confirmation signature.';
COMMENT ON COLUMN acknowledgment.patient_typed_date IS
    'Date typed or selected by the patient when acknowledging the notice.';
COMMENT ON COLUMN acknowledgment.acknowledged_at IS
    'Timestamp when the patient submitted their acknowledgment.';
COMMENT ON COLUMN acknowledgment.created_at IS
    'Timestamp when the row was created.';
COMMENT ON COLUMN acknowledgment.updated_at IS
    'Timestamp when the row was last updated.';
