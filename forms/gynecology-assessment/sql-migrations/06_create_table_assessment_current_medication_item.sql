CREATE TABLE assessment_current_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    indication VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_current_medication_item_updated_at
    BEFORE UPDATE ON assessment_current_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: regular, OTC, herbal supplements, and hormone therapy. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_regular_medications IS
    'Whether the patient takes regular prescription medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.takes_over_the_counter IS
    'Whether the patient takes over-the-counter medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.takes_herbal_supplements IS
    'Whether the patient takes herbal or dietary supplements: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.herbal_supplement_details IS
    'Details of herbal or dietary supplements.';
COMMENT ON COLUMN assessment_current_medications.hormone_therapy IS
    'Whether the patient is on hormone therapy (HRT, oral contraceptives): yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.hormone_therapy_details IS
    'Details of hormone therapy.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Free-text notes on medications.';
COMMENT ON TABLE assessment_current_medication_item IS
    'Individual medication entry within the current medications section.';
COMMENT ON COLUMN assessment_current_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_current_medication_item.dose IS
    'Dose and strength.';
COMMENT ON COLUMN assessment_current_medication_item.frequency IS
    'Dosing frequency.';
COMMENT ON COLUMN assessment_current_medication_item.indication IS
    'Clinical indication for the medication.';
COMMENT ON COLUMN assessment_current_medication_item.sort_order IS
    'Display order within the medication list.';

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
COMMENT ON COLUMN assessment_current_medication_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medication_item.updated_at IS
    'Timestamp when this row was last updated.';
