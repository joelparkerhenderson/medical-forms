CREATE TABLE casualty_card_next_of_kin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id  UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Next of kin details
    name              TEXT NOT NULL DEFAULT '',
    relationship      TEXT NOT NULL DEFAULT '',
    phone             TEXT NOT NULL DEFAULT '',
    notified          TEXT NOT NULL DEFAULT ''
                      CHECK (notified IN ('yes', 'no', ''))
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_next_of_kin_updated_at
    BEFORE UPDATE ON casualty_card_next_of_kin
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_next_of_kin IS
    '1:1 with casualty_card. Next of kin contact details and notification status.';
COMMENT ON COLUMN casualty_card_next_of_kin.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_next_of_kin.name IS
    'Full name of the next of kin.';
COMMENT ON COLUMN casualty_card_next_of_kin.relationship IS
    'Relationship to the patient (e.g. spouse, parent, sibling).';
COMMENT ON COLUMN casualty_card_next_of_kin.phone IS
    'Contact phone number for the next of kin.';
COMMENT ON COLUMN casualty_card_next_of_kin.notified IS
    'Whether the next of kin has been notified: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_next_of_kin.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_next_of_kin.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_next_of_kin.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_next_of_kin.deleted_at IS
    'Timestamp when this row was deleted.';
