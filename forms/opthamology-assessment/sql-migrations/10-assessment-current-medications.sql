-- 10_assessment_current_medications.sql
-- Current medications section of the ophthalmology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_ocular_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_ocular_medications IN ('yes', 'no', '')),
    has_systemic_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_systemic_medications IN ('yes', 'no', '')),
    medication_allergies TEXT NOT NULL DEFAULT '',
    medications_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header: ocular and systemic medications, allergies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.has_ocular_medications IS
    'Whether the patient uses ocular medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.has_systemic_medications IS
    'Whether the patient takes systemic medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.medication_allergies IS
    'Known medication allergies.';
COMMENT ON COLUMN assessment_current_medications.medications_notes IS
    'Additional clinician notes on medications.';

-- Individual medication items (one-to-many child)
CREATE TABLE assessment_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medication_item_updated_at
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
