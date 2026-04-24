CREATE TABLE assessment_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    route VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (route IN ('oral', 'topical', 'inhaled', 'injection', 'rectal', 'other', '')),
    indication TEXT NOT NULL DEFAULT '',
    prescribing_clinician VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_medication_item_updated_at
    BEFORE UPDATE ON assessment_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_item IS
    'Individual medication entry with name, dose, frequency, and route.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dosage amount and unit (e.g. 5mg, 2.5ml).';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Dosing frequency (e.g. twice daily, as needed).';
COMMENT ON COLUMN assessment_medication_item.route IS
    'Route of administration: oral, topical, inhaled, injection, rectal, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.indication IS
    'Clinical indication for the medication.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the medication in the list.';

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.over_the_counter_details IS
    'Over the counter details.';
COMMENT ON COLUMN assessment_current_medications.supplement_details IS
    'Supplement details.';
COMMENT ON COLUMN assessment_current_medications.additional_notes IS
    'Additional notes.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_medication_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_medication_item.current_medications_id IS
    'Foreign key to the assessment_current_medications table.';
COMMENT ON COLUMN assessment_medication_item.prescribing_clinician IS
    'Prescribing clinician.';
COMMENT ON COLUMN assessment_medication_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_medication_item.updated_at IS
    'Timestamp when this row was last updated.';
