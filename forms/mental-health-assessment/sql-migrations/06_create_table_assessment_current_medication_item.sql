CREATE TABLE assessment_current_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    prescriber VARCHAR(255) NOT NULL DEFAULT '',
    start_date DATE,
    medication_class VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (medication_class IN ('antidepressant', 'anxiolytic', 'antipsychotic', 'mood-stabiliser', 'hypnotic', 'stimulant', 'other', '')),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_current_medication_item_updated_at
    BEFORE UPDATE ON assessment_current_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header: psychotropic medication status and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.taking_psychotropic_medication IS
    'Whether the patient is taking psychotropic medication: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Self-reported medication adherence: good, partial, poor, or empty string.';
COMMENT ON COLUMN assessment_current_medications.side_effects IS
    'Whether the patient reports medication side effects: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.side_effects_details IS
    'Free-text description of medication side effects.';
COMMENT ON COLUMN assessment_current_medications.over_the_counter_medications IS
    'Free-text list of over-the-counter medications.';
COMMENT ON COLUMN assessment_current_medications.supplements IS
    'Free-text list of dietary supplements.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Free-text clinician notes on medications.';
COMMENT ON TABLE assessment_current_medication_item IS
    'Individual medication entry with name, dose, frequency, and medication class.';
COMMENT ON COLUMN assessment_current_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_current_medication_item.dose IS
    'Dose of the medication (e.g. 50mg).';
COMMENT ON COLUMN assessment_current_medication_item.frequency IS
    'Frequency of administration (e.g. once daily, twice daily).';
COMMENT ON COLUMN assessment_current_medication_item.prescriber IS
    'Name of the prescribing clinician.';
COMMENT ON COLUMN assessment_current_medication_item.start_date IS
    'Date the medication was started.';
COMMENT ON COLUMN assessment_current_medication_item.medication_class IS
    'Medication class: antidepressant, anxiolytic, antipsychotic, mood-stabiliser, hypnotic, stimulant, other, or empty string.';

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_current_medication_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medication_item.current_medications_id IS
    'Foreign key to the assessment_current_medications table.';
COMMENT ON COLUMN assessment_current_medication_item.sort_order IS
    'Sort order.';
COMMENT ON COLUMN assessment_current_medication_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medication_item.updated_at IS
    'Timestamp when this row was last updated.';
