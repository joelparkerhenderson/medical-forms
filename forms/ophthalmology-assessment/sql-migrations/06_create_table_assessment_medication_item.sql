CREATE TABLE assessment_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    route VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (route IN ('topical', 'oral', 'intravitreal', 'periocular', 'iv', 'other', '')),
    eye VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (eye IN ('right', 'left', 'both', 'systemic', '')),
    indication VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_assessment_medication_item_updated_at
    BEFORE UPDATE ON assessment_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_item IS
    'Individual medication entry with name, dose, frequency, route, and target eye.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dose of the medication.';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Frequency of administration.';
COMMENT ON COLUMN assessment_medication_item.route IS
    'Route of administration: topical, oral, intravitreal, periocular, iv, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.eye IS
    'Target eye: right, left, both, systemic, or empty.';
COMMENT ON COLUMN assessment_medication_item.indication IS
    'Indication for the medication.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the item within the list.';

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_medication_item.current_medications_id IS
    'Foreign key to the assessment_current_medications table.';
COMMENT ON COLUMN assessment_medication_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_medication_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_medication_item.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_medication_item.deleted_at IS
    'Timestamp when this row was deleted.';
