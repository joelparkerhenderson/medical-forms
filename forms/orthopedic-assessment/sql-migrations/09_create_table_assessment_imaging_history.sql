CREATE TABLE assessment_imaging_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    has_previous_imaging VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_previous_imaging IN ('yes', 'no', '')),
    imaging_requested VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (imaging_requested IN ('yes', 'no', '')),
    imaging_requested_details TEXT NOT NULL DEFAULT '',
    imaging_notes TEXT NOT NULL DEFAULT ''
);

CREATE TRIGGER trigger_assessment_imaging_history_updated_at
    BEFORE UPDATE ON assessment_imaging_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_imaging_history IS
    'Imaging history section header: prior imaging and new requests. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_imaging_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_imaging_history.has_previous_imaging IS
    'Whether the patient has had previous imaging: yes, no, or empty.';
COMMENT ON COLUMN assessment_imaging_history.imaging_requested IS
    'Whether new imaging has been requested: yes, no, or empty.';
COMMENT ON COLUMN assessment_imaging_history.imaging_requested_details IS
    'Details of newly requested imaging.';
COMMENT ON COLUMN assessment_imaging_history.imaging_notes IS
    'Additional notes on imaging history.';

COMMENT ON COLUMN assessment_imaging_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_imaging_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_imaging_history.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_imaging_history.deleted_at IS
    'Timestamp when this row was deleted.';
-- Individual imaging study items (one-to-many child)

