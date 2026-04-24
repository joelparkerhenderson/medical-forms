CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    has_ocular_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_ocular_medications IN ('yes', 'no', '')),
    has_systemic_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_systemic_medications IN ('yes', 'no', '')),
    medication_allergies TEXT NOT NULL DEFAULT '',
    medications_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header: ocular and systemic medications, allergies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.has_ocular_medications IS
    'Whether the patient uses ocular medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.has_systemic_medications IS
    'Whether the patient takes systemic medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.medication_allergies IS
    'Known medication allergies.';
COMMENT ON COLUMN assessment_current_medications.medications_notes IS
    'Additional clinician notes on medications.';

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_current_medications.deleted_at IS
    'Timestamp when this row was deleted.';
-- Individual medication items (one-to-many child)

