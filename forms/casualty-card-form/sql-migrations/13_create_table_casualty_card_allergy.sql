CREATE TABLE casualty_card_allergy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- Many-to-one: each casualty card can have multiple allergies
    casualty_card_id  UUID NOT NULL REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Allergy details
    allergen          TEXT NOT NULL DEFAULT '',
    reaction          TEXT NOT NULL DEFAULT '',
    severity          TEXT NOT NULL DEFAULT ''
                      CHECK (severity IN ('mild', 'moderate', 'anaphylaxis', '')),
    -- Display ordering (1-based)
    sort_order        INTEGER NOT NULL DEFAULT 0
);

-- Index for fetching all allergies for a casualty card
CREATE INDEX idx_casualty_card_allergy_casualty_card_id
    ON casualty_card_allergy(casualty_card_id);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_allergy_updated_at
    BEFORE UPDATE ON casualty_card_allergy
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_allergy IS
    'Many-to-one with casualty_card. Each row is one documented allergy.';
COMMENT ON COLUMN casualty_card_allergy.casualty_card_id IS
    'FK to casualty_card. One casualty card may have many allergies.';
COMMENT ON COLUMN casualty_card_allergy.allergen IS
    'Name of the allergen (e.g. Penicillin, Latex).';
COMMENT ON COLUMN casualty_card_allergy.reaction IS
    'Description of the allergic reaction.';
COMMENT ON COLUMN casualty_card_allergy.severity IS
    'Allergy severity: mild, moderate, anaphylaxis, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_allergy.sort_order IS
    'Display ordering for consistent list rendering.';
COMMENT ON COLUMN casualty_card_allergy.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_allergy.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_allergy.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_allergy.deleted_at IS
    'Timestamp when this row was deleted.';
