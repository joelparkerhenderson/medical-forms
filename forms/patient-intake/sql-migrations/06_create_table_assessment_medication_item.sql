CREATE TABLE assessment_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    medications_id UUID NOT NULL
        REFERENCES assessment_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    route VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (route IN ('oral', 'topical', 'inhaled', 'injectable', 'other', '')),
    prescriber VARCHAR(255) NOT NULL DEFAULT '',
    reason VARCHAR(255) NOT NULL DEFAULT '',
    start_date DATE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_medication_item_updated_at
    BEFORE UPDATE ON assessment_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_item IS
    'Individual medication entry with name, dose, frequency, and prescriber.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dose of the medication.';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Frequency of administration.';
COMMENT ON COLUMN assessment_medication_item.route IS
    'Route of administration: oral, topical, inhaled, injectable, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.prescriber IS
    'Name of the prescribing clinician.';
COMMENT ON COLUMN assessment_medication_item.reason IS
    'Reason or indication for the medication.';
COMMENT ON COLUMN assessment_medication_item.start_date IS
    'Date the medication was started.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the item within the list.';

COMMENT ON COLUMN assessment_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_medications.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_medication_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_medication_item.medications_id IS
    'Foreign key to the assessment_medications table.';
COMMENT ON COLUMN assessment_medication_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_medication_item.updated_at IS
    'Timestamp when this row was last updated.';
