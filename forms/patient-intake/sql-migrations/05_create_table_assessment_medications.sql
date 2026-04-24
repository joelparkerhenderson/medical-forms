CREATE TABLE assessment_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_medications IN ('yes', 'no', '')),
    takes_over_the_counter VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_over_the_counter IN ('yes', 'no', '')),
    takes_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_supplements IN ('yes', 'no', '')),
    supplement_details TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'partial', 'poor', '')),
    pharmacy_name VARCHAR(255) NOT NULL DEFAULT '',
    pharmacy_phone VARCHAR(50) NOT NULL DEFAULT '',
    medications_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_medications_updated_at
    BEFORE UPDATE ON assessment_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medications IS
    'Current medications section header: prescription, OTC, supplements, and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medications.takes_medications IS
    'Whether the patient takes prescription medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications.takes_over_the_counter IS
    'Whether the patient takes over-the-counter medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications.takes_supplements IS
    'Whether the patient takes vitamins or supplements: yes, no, or empty.';
COMMENT ON COLUMN assessment_medications.supplement_details IS
    'Details of supplements and vitamins.';
COMMENT ON COLUMN assessment_medications.medication_adherence IS
    'Overall medication adherence: good, partial, poor, or empty.';
COMMENT ON COLUMN assessment_medications.pharmacy_name IS
    'Name of the patient regular pharmacy.';
COMMENT ON COLUMN assessment_medications.pharmacy_phone IS
    'Telephone number of the pharmacy.';
COMMENT ON COLUMN assessment_medications.medications_notes IS
    'Additional notes on medications.';

-- Individual medication items (one-to-many child)

COMMENT ON COLUMN assessment_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_medications.updated_at IS
    'Timestamp when this row was last updated.';
