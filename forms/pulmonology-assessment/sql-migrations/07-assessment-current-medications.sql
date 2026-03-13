-- 07_assessment_current_medications.sql
-- Current medications section of the pulmonology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    inhaler_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_use IN ('yes', 'no', '')),
    inhaler_technique_assessed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_technique_assessed IN ('yes', 'no', '')),
    inhaler_technique_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_technique_adequate IN ('yes', 'no', '')),
    short_acting_bronchodilator VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (short_acting_bronchodilator IN ('yes', 'no', '')),
    saba_frequency TEXT NOT NULL DEFAULT '',
    long_acting_bronchodilator VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (long_acting_bronchodilator IN ('yes', 'no', '')),
    inhaled_corticosteroid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaled_corticosteroid IN ('yes', 'no', '')),
    combination_inhaler VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (combination_inhaler IN ('yes', 'no', '')),
    long_term_oxygen_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (long_term_oxygen_therapy IN ('yes', 'no', '')),
    oxygen_flow_rate_lmin NUMERIC(3,1)
        CHECK (oxygen_flow_rate_lmin IS NULL OR oxygen_flow_rate_lmin > 0),
    oxygen_hours_per_day INTEGER
        CHECK (oxygen_hours_per_day IS NULL OR (oxygen_hours_per_day >= 0 AND oxygen_hours_per_day <= 24)),
    nebuliser_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nebuliser_use IN ('yes', 'no', '')),
    oral_medications TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'fair', 'poor', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: inhaler therapy, oxygen therapy, nebuliser use, and medication adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.inhaler_use IS
    'Whether the patient uses inhaler devices.';
COMMENT ON COLUMN assessment_current_medications.inhaler_technique_assessed IS
    'Whether inhaler technique was assessed during the visit.';
COMMENT ON COLUMN assessment_current_medications.inhaler_technique_adequate IS
    'Whether inhaler technique is adequate.';
COMMENT ON COLUMN assessment_current_medications.short_acting_bronchodilator IS
    'Whether the patient uses a short-acting bronchodilator (SABA, e.g. salbutamol).';
COMMENT ON COLUMN assessment_current_medications.long_acting_bronchodilator IS
    'Whether the patient uses a long-acting bronchodilator (LABA or LAMA).';
COMMENT ON COLUMN assessment_current_medications.inhaled_corticosteroid IS
    'Whether the patient uses an inhaled corticosteroid (ICS).';
COMMENT ON COLUMN assessment_current_medications.combination_inhaler IS
    'Whether the patient uses a combination inhaler (ICS/LABA or LABA/LAMA).';
COMMENT ON COLUMN assessment_current_medications.long_term_oxygen_therapy IS
    'Whether the patient is on long-term oxygen therapy (LTOT).';
COMMENT ON COLUMN assessment_current_medications.oxygen_flow_rate_lmin IS
    'Oxygen flow rate in litres per minute.';
COMMENT ON COLUMN assessment_current_medications.nebuliser_use IS
    'Whether the patient uses a nebuliser at home.';
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
    'Individual medication entry with name, dose, frequency, and route of administration.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dosage amount and unit (e.g. 200mcg, 500mg).';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Dosing frequency (e.g. twice daily, as needed).';
COMMENT ON COLUMN assessment_medication_item.route IS
    'Route of administration: inhaled, oral, nebulised, subcutaneous, intravenous, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the medication in the list.';
