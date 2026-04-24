CREATE TABLE encounter_satisfaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- Foreign key to the patient this survey belongs to
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    -- Workflow status tracking
    status              TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed', 'reviewed', ''))
);

-- Index for the most common query: all surveys for a patient
CREATE INDEX idx_encounter_satisfaction_patient_id ON encounter_satisfaction(patient_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_encounter_satisfaction_updated_at
    BEFORE UPDATE ON encounter_satisfaction
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE encounter_satisfaction IS
    'A single encounter satisfaction survey record. Child tables hold section-specific data.';
COMMENT ON COLUMN encounter_satisfaction.patient_id IS
    'FK to patient. One patient may have many surveys.';
COMMENT ON COLUMN encounter_satisfaction.status IS
    'Workflow status: in_progress, completed, reviewed, or empty string if unanswered.';
COMMENT ON COLUMN encounter_satisfaction.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN encounter_satisfaction.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN encounter_satisfaction.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN encounter_satisfaction.deleted_at IS
    'Timestamp when this row was deleted.';
