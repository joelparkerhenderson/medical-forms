-- 09_assessment_current_medications.sql
-- Current medications section of the psychiatry assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_psychiatric_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_psychiatric_medications IN ('yes', 'no', '')),
    takes_other_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_other_medications IN ('yes', 'no', '')),
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'fair', 'poor', '')),
    adherence_barriers TEXT NOT NULL DEFAULT '',
    side_effects TEXT NOT NULL DEFAULT '',
    clozapine_registered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clozapine_registered IN ('yes', 'no', '')),
    depot_injection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depot_injection IN ('yes', 'no', '')),
    depot_details TEXT NOT NULL DEFAULT '',
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
COMMENT ON COLUMN assessment_current_medications.takes_psychiatric_medications IS
    'Whether the patient takes psychiatric medications.';
COMMENT ON COLUMN assessment_current_medications.takes_other_medications IS
    'Whether the patient takes non-psychiatric medications.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Medication adherence: good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_current_medications.adherence_barriers IS
    'Free-text description of barriers to medication adherence.';
COMMENT ON COLUMN assessment_current_medications.side_effects IS
    'Free-text description of medication side effects experienced.';
COMMENT ON COLUMN assessment_current_medications.clozapine_registered IS
    'Whether the patient is registered on a clozapine monitoring programme.';
COMMENT ON COLUMN assessment_current_medications.depot_injection IS
    'Whether the patient receives depot (long-acting injectable) medication.';

-- Individual medication items (one-to-many child)
CREATE TABLE assessment_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    medication_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (medication_type IN ('antidepressant', 'antipsychotic', 'anxiolytic', 'mood-stabiliser', 'hypnotic', 'stimulant', 'other', '')),
    indication TEXT NOT NULL DEFAULT '',
    prescribing_clinician VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medication_item_updated_at
    BEFORE UPDATE ON assessment_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_item IS
    'Individual medication entry with name, dose, frequency, and classification.';
COMMENT ON COLUMN assessment_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_medication_item.dose IS
    'Dosage amount and unit (e.g. 20mg, 100mg).';
COMMENT ON COLUMN assessment_medication_item.frequency IS
    'Dosing frequency (e.g. once daily, twice daily, as needed).';
COMMENT ON COLUMN assessment_medication_item.medication_type IS
    'Medication classification: antidepressant, antipsychotic, anxiolytic, mood-stabiliser, hypnotic, stimulant, other, or empty.';
COMMENT ON COLUMN assessment_medication_item.indication IS
    'Clinical indication for the medication.';
COMMENT ON COLUMN assessment_medication_item.sort_order IS
    'Display order of the medication in the list.';
