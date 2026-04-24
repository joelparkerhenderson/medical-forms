CREATE TABLE casualty_card_medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- Many-to-one: each casualty card can have multiple medications
    casualty_card_id  UUID NOT NULL REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Medication details
    name              TEXT NOT NULL DEFAULT '',
    dose              TEXT NOT NULL DEFAULT '',
    frequency         TEXT NOT NULL DEFAULT '',
    -- Display ordering (1-based)
    sort_order        INTEGER NOT NULL DEFAULT 0
);

-- Index for fetching all medications for a casualty card
CREATE INDEX idx_casualty_card_medication_casualty_card_id
    ON casualty_card_medication(casualty_card_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_medication_updated_at
    BEFORE UPDATE ON casualty_card_medication
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_medication IS
    'Many-to-one with casualty_card. Each row is one current medication the patient takes.';
COMMENT ON COLUMN casualty_card_medication.casualty_card_id IS
    'FK to casualty_card. One casualty card may have many medications.';
COMMENT ON COLUMN casualty_card_medication.name IS
    'Medication name (e.g. Metformin, Warfarin).';
COMMENT ON COLUMN casualty_card_medication.dose IS
    'Dose (e.g. 500mg, 5mg).';
COMMENT ON COLUMN casualty_card_medication.frequency IS
    'Frequency (e.g. once daily, twice daily, PRN).';
COMMENT ON COLUMN casualty_card_medication.sort_order IS
    'Display ordering for consistent list rendering.';
COMMENT ON COLUMN casualty_card_medication.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_medication.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_medication.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_medication.deleted_at IS
    'Timestamp when this row was deleted.';
