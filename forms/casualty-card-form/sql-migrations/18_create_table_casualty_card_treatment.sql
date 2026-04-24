CREATE TABLE casualty_card_treatment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id          UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Oxygen therapy
    oxygen_therapy_device     TEXT NOT NULL DEFAULT '',
    oxygen_therapy_flow_rate  TEXT NOT NULL DEFAULT '',
    -- Tetanus prophylaxis
    tetanus_prophylaxis       TEXT NOT NULL DEFAULT ''
                              CHECK (tetanus_prophylaxis IN ('given', 'not-indicated', 'status-checked', ''))
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_treatment_updated_at
    BEFORE UPDATE ON casualty_card_treatment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_treatment IS
    '1:1 with casualty_card. Oxygen therapy and tetanus prophylaxis. Medications, fluids, and procedures are separate tables.';
COMMENT ON COLUMN casualty_card_treatment.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_treatment.oxygen_therapy_device IS
    'Oxygen delivery device (e.g. nasal cannula, simple face mask, non-rebreather mask).';
COMMENT ON COLUMN casualty_card_treatment.oxygen_therapy_flow_rate IS
    'Oxygen flow rate (e.g. 2L/min, 15L/min).';
COMMENT ON COLUMN casualty_card_treatment.tetanus_prophylaxis IS
    'Tetanus prophylaxis status: given, not-indicated, status-checked, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_treatment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_treatment.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_treatment.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_treatment.deleted_at IS
    'Timestamp when this row was deleted.';
