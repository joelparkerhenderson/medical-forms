CREATE TABLE casualty_card_gp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id  UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- GP details
    name              TEXT NOT NULL DEFAULT '',
    practice_name     TEXT NOT NULL DEFAULT '',
    practice_address  TEXT NOT NULL DEFAULT '',
    practice_phone    TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_gp_updated_at
    BEFORE UPDATE ON casualty_card_gp
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_gp IS
    '1:1 with casualty_card. Registered GP and practice details for communication and follow-up.';
COMMENT ON COLUMN casualty_card_gp.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_gp.name IS
    'Full name of the patient registered GP.';
COMMENT ON COLUMN casualty_card_gp.practice_name IS
    'Name of the GP practice.';
COMMENT ON COLUMN casualty_card_gp.practice_address IS
    'Address of the GP practice.';
COMMENT ON COLUMN casualty_card_gp.practice_phone IS
    'Phone number of the GP practice.';
COMMENT ON COLUMN casualty_card_gp.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_gp.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_gp.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_gp.deleted_at IS
    'Timestamp when this row was deleted.';
