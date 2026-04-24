CREATE TABLE casualty_card (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- Foreign key to the patient this casualty card belongs to
    patient_id          UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    -- Workflow status tracking
    status              TEXT NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed', 'reviewed', '')),
    -- Attendance timing
    attendance_date     DATE,
    arrival_time        TIMESTAMPTZ
);

-- Index for the most common query: all casualty cards for a patient
CREATE INDEX idx_casualty_card_patient_id ON casualty_card(patient_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_updated_at
    BEFORE UPDATE ON casualty_card
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card IS
    'A single ED or MIU attendance record. Child tables hold section-specific clinical data.';
COMMENT ON COLUMN casualty_card.patient_id IS
    'FK to patient. One patient may have many casualty cards.';
COMMENT ON COLUMN casualty_card.status IS
    'Workflow status: in_progress, completed, reviewed, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card.attendance_date IS
    'Date of ED attendance. NULL if not recorded.';
COMMENT ON COLUMN casualty_card.arrival_time IS
    'Timestamp of patient arrival at the department. NULL if not recorded.';
COMMENT ON COLUMN casualty_card.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card.deleted_at IS
    'Timestamp when this row was deleted.';
