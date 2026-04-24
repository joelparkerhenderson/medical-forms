CREATE TABLE assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- Foreign key to the patient this assessment belongs to
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    -- Assessment status tracking
    status              TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed', 'reviewed'))
);

-- Index for the most common query: all assessments for a patient
CREATE INDEX idx_assessment_patient_id ON assessment(patient_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_assessment_updated_at
    BEFORE UPDATE ON assessment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment IS
    'A single ergonomic assessment visit. Child tables hold section-specific data.';
COMMENT ON COLUMN assessment.patient_id IS
    'FK to patient. One patient may have many assessments.';
COMMENT ON COLUMN assessment.status IS
    'Workflow status: in_progress (patient filling in), completed (submitted), reviewed (clinician signed off).';
COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment.deleted_at IS
    'Timestamp when this row was deleted.';
