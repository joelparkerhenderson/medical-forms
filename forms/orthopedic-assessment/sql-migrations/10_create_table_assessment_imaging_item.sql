CREATE TABLE assessment_imaging_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    imaging_history_id UUID NOT NULL
        REFERENCES assessment_imaging_history(id) ON DELETE CASCADE,

    modality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (modality IN ('x-ray', 'mri', 'ct', 'ultrasound', 'bone-scan', 'dexa', 'other', '')),
    body_region VARCHAR(100) NOT NULL DEFAULT '',
    date_performed DATE,
    findings TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_imaging_item_updated_at
    BEFORE UPDATE ON assessment_imaging_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_imaging_item IS
    'Individual imaging study with modality, region, date, and findings.';
COMMENT ON COLUMN assessment_imaging_item.modality IS
    'Imaging modality: x-ray, mri, ct, ultrasound, bone-scan, dexa, other, or empty.';
COMMENT ON COLUMN assessment_imaging_item.body_region IS
    'Body region imaged.';
COMMENT ON COLUMN assessment_imaging_item.date_performed IS
    'Date the imaging was performed.';
COMMENT ON COLUMN assessment_imaging_item.findings IS
    'Summary of imaging findings.';
COMMENT ON COLUMN assessment_imaging_item.sort_order IS
    'Display order of the item within the list.';

COMMENT ON COLUMN assessment_imaging_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_imaging_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_imaging_history.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_imaging_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_imaging_item.imaging_history_id IS
    'Foreign key to the assessment_imaging_history table.';
COMMENT ON COLUMN assessment_imaging_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_imaging_item.updated_at IS
    'Timestamp when this row was last updated.';
