-- 10_assessment_imaging_history.sql
-- Imaging history section of the orthopaedic assessment.

CREATE TABLE assessment_imaging_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_previous_imaging VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_previous_imaging IN ('yes', 'no', '')),
    imaging_requested VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (imaging_requested IN ('yes', 'no', '')),
    imaging_requested_details TEXT NOT NULL DEFAULT '',
    imaging_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_imaging_history_updated_at
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

-- Individual imaging study items (one-to-many child)
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

CREATE TRIGGER trg_assessment_imaging_item_updated_at
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
