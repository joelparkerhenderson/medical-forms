-- 10_assessment_current_medications.sql
-- Current medications section of the oncology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    polypharmacy_concern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polypharmacy_concern IN ('yes', 'no', '')),
    drug_interactions_identified VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (drug_interactions_identified IN ('yes', 'no', '')),
    drug_interaction_details TEXT NOT NULL DEFAULT '',
    complementary_medicines VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (complementary_medicines IN ('yes', 'no', '')),
    complementary_medicine_details TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'partial', 'poor', '')),
    medications_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section header: polypharmacy concerns, interactions, and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.polypharmacy_concern IS
    'Whether polypharmacy is a concern: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.drug_interactions_identified IS
    'Whether drug interactions have been identified: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.drug_interaction_details IS
    'Details of identified drug interactions.';
COMMENT ON COLUMN assessment_current_medications.complementary_medicines IS
    'Whether the patient uses complementary or alternative medicines: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.complementary_medicine_details IS
    'Details of complementary or alternative medicines being used.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Overall medication adherence: good, partial, poor, or empty.';
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
    route VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (route IN ('oral', 'iv', 'sc', 'im', 'topical', 'inhaled', 'rectal', 'other', '')),
    indication VARCHAR(255) NOT NULL DEFAULT '',
    start_date DATE,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medication_item_updated_at
    BEFORE UPDATE ON assessment_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_item IS
    'Individual medication entry with name, dose, frequency, route, and indication.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dose of the medication (e.g. 500mg, 10mg/kg).';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Frequency of administration (e.g. once daily, twice daily, PRN).';
COMMENT ON COLUMN assessment_medication_item.route IS
    'Route of administration: oral, iv, sc, im, topical, inhaled, rectal, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.indication IS
    'Indication for the medication.';
COMMENT ON COLUMN assessment_medication_item.start_date IS
    'Date the medication was started.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the item within the list.';
