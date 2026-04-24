CREATE TABLE casualty_card_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with casualty_card (UNIQUE constraint)
    casualty_card_id        UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,
    -- Blood tests (array of selected test types, e.g. FBC, U&E, LFTs, CRP, troponin)
    blood_tests             TEXT[] NOT NULL DEFAULT '{}',
    -- Urinalysis
    urinalysis              TEXT NOT NULL DEFAULT '',
    pregnancy_test          TEXT NOT NULL DEFAULT '',
    -- ECG
    ecg_performed           TEXT NOT NULL DEFAULT ''
                            CHECK (ecg_performed IN ('yes', 'no', '')),
    ecg_findings            TEXT NOT NULL DEFAULT '',
    -- Other investigations
    other_investigations    TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_casualty_card_investigations_updated_at
    BEFORE UPDATE ON casualty_card_investigations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE casualty_card_investigations IS
    '1:1 with casualty_card. Investigations ordered and their results.';
COMMENT ON COLUMN casualty_card_investigations.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN casualty_card_investigations.blood_tests IS
    'Array of blood test types ordered (e.g. FBC, U&E, LFTs, CRP, coagulation, troponin).';
COMMENT ON COLUMN casualty_card_investigations.urinalysis IS
    'Urinalysis dipstick results.';
COMMENT ON COLUMN casualty_card_investigations.pregnancy_test IS
    'Pregnancy test result.';
COMMENT ON COLUMN casualty_card_investigations.ecg_performed IS
    'Whether an ECG was performed: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN casualty_card_investigations.ecg_findings IS
    'ECG interpretation findings.';
COMMENT ON COLUMN casualty_card_investigations.other_investigations IS
    'Free-text description of other investigations performed.';
COMMENT ON COLUMN casualty_card_investigations.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN casualty_card_investigations.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN casualty_card_investigations.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN casualty_card_investigations.deleted_at IS
    'Timestamp when this row was deleted.';
