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

CREATE TRIGGER trigger_assessment_current_medications_updated_at
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

COMMENT ON COLUMN assessment_current_medications.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_current_medications.saba_frequency IS
    'Saba frequency.';
COMMENT ON COLUMN assessment_current_medications.oxygen_hours_per_day IS
    'Oxygen hours per day.';
COMMENT ON COLUMN assessment_current_medications.oral_medications IS
    'Oral medications.';
COMMENT ON COLUMN assessment_current_medications.additional_notes IS
    'Additional notes.';
COMMENT ON COLUMN assessment_current_medications.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_current_medications.updated_at IS
    'Timestamp when this row was last updated.';
