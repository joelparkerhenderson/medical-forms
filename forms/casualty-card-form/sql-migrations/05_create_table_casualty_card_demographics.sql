CREATE TABLE casualty_card_demographics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id      UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Assessment-time demographics (may differ from patient record)
    address               TEXT NOT NULL DEFAULT '',
    postcode              TEXT NOT NULL DEFAULT '',
    phone                 TEXT NOT NULL DEFAULT '',
    email                 TEXT NOT NULL DEFAULT '',
    ethnicity             TEXT NOT NULL DEFAULT '',
    preferred_language    TEXT NOT NULL DEFAULT '',
    interpreter_required  TEXT NOT NULL DEFAULT ''
                          CHECK (interpreter_required IN ('yes', 'no', ''))
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_demographics_updated_at
    BEFORE UPDATE ON casualty_card_demographics
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_demographics IS
    '1:1 with casualty_card. Assessment-time demographic data that may differ from the patient record.';
COMMENT ON COLUMN casualty_card_demographics.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_demographics.address IS
    'Patient address at time of attendance.';
COMMENT ON COLUMN casualty_card_demographics.postcode IS
    'Patient postcode at time of attendance.';
COMMENT ON COLUMN casualty_card_demographics.phone IS
    'Patient phone number at time of attendance.';
COMMENT ON COLUMN casualty_card_demographics.email IS
    'Patient email address at time of attendance.';
COMMENT ON COLUMN casualty_card_demographics.ethnicity IS
    'Patient ethnicity at time of attendance.';
COMMENT ON COLUMN casualty_card_demographics.preferred_language IS
    'Patient preferred language at time of attendance.';
COMMENT ON COLUMN casualty_card_demographics.interpreter_required IS
    'Whether an interpreter is required: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_demographics.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_demographics.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_demographics.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_demographics.deleted_at IS
    'Timestamp when this row was deleted.';
