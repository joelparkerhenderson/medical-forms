-- 08_assessment_current_medications.sql
-- Current medications section of the respirology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_respiratory_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_respiratory_medications IN ('yes', 'no', '')),
    inhaler_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_use IN ('yes', 'no', '')),
    inhaler_technique_assessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_technique_assessed IN ('yes', 'no', '')),
    inhaler_technique_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_technique_adequate IN ('yes', 'no', '')),
    long_term_oxygen_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (long_term_oxygen_therapy IN ('yes', 'no', '')),
    nebuliser_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nebuliser_use IN ('yes', 'no', '')),
    takes_other_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_other_medications IN ('yes', 'no', '')),
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'fair', 'poor', '')),
    adverse_drug_reactions TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_respiratory_medications IS
    'Whether the patient takes respiratory medications.';
COMMENT ON COLUMN assessment_current_medications.inhaler_use IS
    'Whether the patient uses inhaler devices.';
COMMENT ON COLUMN assessment_current_medications.inhaler_technique_assessed IS
    'Whether inhaler technique was assessed.';
COMMENT ON COLUMN assessment_current_medications.inhaler_technique_adequate IS
    'Whether inhaler technique is adequate.';
COMMENT ON COLUMN assessment_current_medications.long_term_oxygen_therapy IS
    'Whether the patient is on long-term oxygen therapy.';
COMMENT ON COLUMN assessment_current_medications.nebuliser_use IS
    'Whether the patient uses a nebuliser.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Medication adherence: good, fair, poor, or empty.';

-- Individual medication items (one-to-many child)
CREATE TABLE assessment_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    route VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (route IN ('inhaled', 'oral', 'nebulised', 'subcutaneous', 'intravenous', 'other', '')),
    indication TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medication_item_updated_at
    BEFORE UPDATE ON assessment_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_item IS
    'Individual medication entry with name, dose, frequency, and route.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dosage amount and unit.';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Dosing frequency.';
COMMENT ON COLUMN assessment_medication_item.route IS
    'Route of administration: inhaled, oral, nebulised, subcutaneous, intravenous, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the medication in the list.';
