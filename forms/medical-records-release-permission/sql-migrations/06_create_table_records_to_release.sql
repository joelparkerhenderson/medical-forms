CREATE TABLE records_to_release (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    release_form_id UUID NOT NULL UNIQUE
        REFERENCES release_form(id) ON DELETE CASCADE,

    record_types TEXT[] NOT NULL DEFAULT '{}',
    specific_date_range VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (specific_date_range IN ('yes', 'no', '')),
    date_from DATE,
    date_to DATE,
    specific_record_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (date_to IS NULL OR date_from IS NULL OR date_to >= date_from)
);

CREATE TRIGGER trigger_records_to_release_updated_at
    BEFORE UPDATE ON records_to_release
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE records_to_release IS
    'Types and date range of medical records to be released. One-to-one child of release_form.';
COMMENT ON COLUMN records_to_release.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN records_to_release.release_form_id IS
    'Foreign key to the parent release form (unique, enforcing 1:1).';
COMMENT ON COLUMN records_to_release.record_types IS
    'Array of record type identifiers selected for release.';
COMMENT ON COLUMN records_to_release.specific_date_range IS
    'Whether a specific date range applies: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN records_to_release.date_from IS
    'Start date of the records date range (nullable).';
COMMENT ON COLUMN records_to_release.date_to IS
    'End date of the records date range (nullable). Must be >= date_from when both are set.';
COMMENT ON COLUMN records_to_release.specific_record_details IS
    'Free-text description of specific records requested.';

COMMENT ON COLUMN records_to_release.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN records_to_release.updated_at IS
    'Timestamp when this row was last updated.';
