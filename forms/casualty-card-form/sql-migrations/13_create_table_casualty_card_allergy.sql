CREATE TABLE casualty_card_allergy (
    -- Primary key
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Many-to-one: each casualty card can have multiple allergies
    casualty_card_id  UUID NOT NULL REFERENCES casualty_card(id) ON DELETE CASCADE,

    -- Allergy details
    allergen          TEXT NOT NULL DEFAULT '',
    reaction          TEXT NOT NULL DEFAULT '',
    severity          TEXT NOT NULL DEFAULT ''
                      CHECK (severity IN ('mild', 'moderate', 'anaphylaxis', '')),

    -- Display ordering (1-based)
    sort_order        INTEGER NOT NULL DEFAULT 0,

    -- Audit timestamps
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
COMMENT ON COLUMN casualty_card_allergy.id IS
    'UUIDv4 primary key, auto-generated.';
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
COMMENT ON COLUMN casualty_card_allergy.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN casualty_card_allergy.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
