CREATE TABLE casualty_card_presenting_complaint (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id              UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Chief complaint
    chief_complaint               TEXT NOT NULL DEFAULT '',
    history_of_presenting_complaint TEXT NOT NULL DEFAULT '',
    -- SOCRATES-style structured history
    onset                         TEXT NOT NULL DEFAULT '',
    duration                      TEXT NOT NULL DEFAULT '',
    character                     TEXT NOT NULL DEFAULT '',
    severity                      TEXT NOT NULL DEFAULT '',
    location                      TEXT NOT NULL DEFAULT '',
    radiation                     TEXT NOT NULL DEFAULT '',
    aggravating_factors           TEXT NOT NULL DEFAULT '',
    relieving_factors             TEXT NOT NULL DEFAULT '',
    associated_symptoms           TEXT NOT NULL DEFAULT '',
    -- Additional history
    previous_episodes             TEXT NOT NULL DEFAULT '',
    treatment_prior_to_arrival    TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_presenting_complaint_updated_at
    BEFORE UPDATE ON casualty_card_presenting_complaint
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_presenting_complaint IS
    '1:1 with casualty_card. Chief complaint and structured history using SOCRATES framework.';
COMMENT ON COLUMN casualty_card_presenting_complaint.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_presenting_complaint.chief_complaint IS
    'Brief description of the main reason for attendance.';
COMMENT ON COLUMN casualty_card_presenting_complaint.history_of_presenting_complaint IS
    'Detailed narrative history of the presenting complaint.';
COMMENT ON COLUMN casualty_card_presenting_complaint.onset IS
    'When the symptoms started (e.g. sudden, gradual, 2 hours ago).';
COMMENT ON COLUMN casualty_card_presenting_complaint.duration IS
    'How long the symptoms have been present.';
COMMENT ON COLUMN casualty_card_presenting_complaint.character IS
    'Nature of the symptoms (e.g. sharp, dull, burning, colicky).';
COMMENT ON COLUMN casualty_card_presenting_complaint.severity IS
    'Patient-reported severity of symptoms.';
COMMENT ON COLUMN casualty_card_presenting_complaint.location IS
    'Anatomical location of the symptoms.';
COMMENT ON COLUMN casualty_card_presenting_complaint.radiation IS
    'Whether and where symptoms radiate to.';
COMMENT ON COLUMN casualty_card_presenting_complaint.aggravating_factors IS
    'Factors that worsen the symptoms.';
COMMENT ON COLUMN casualty_card_presenting_complaint.relieving_factors IS
    'Factors that relieve or improve the symptoms.';
COMMENT ON COLUMN casualty_card_presenting_complaint.associated_symptoms IS
    'Other symptoms occurring alongside the chief complaint.';
COMMENT ON COLUMN casualty_card_presenting_complaint.previous_episodes IS
    'History of previous similar episodes.';
COMMENT ON COLUMN casualty_card_presenting_complaint.treatment_prior_to_arrival IS
    'Any treatment received before arriving at the department.';
COMMENT ON COLUMN casualty_card_presenting_complaint.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_presenting_complaint.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_presenting_complaint.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_presenting_complaint.deleted_at IS
    'Timestamp when this row was deleted.';
