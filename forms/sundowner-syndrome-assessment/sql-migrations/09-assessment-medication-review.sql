-- 09_assessment_medication_review.sql
-- Medication review section of the sundowner syndrome assessment.

CREATE TABLE assessment_medication_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    on_cholinesterase_inhibitor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_cholinesterase_inhibitor IN ('yes', 'no', '')),
    cholinesterase_inhibitor_details TEXT NOT NULL DEFAULT '',
    on_memantine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_memantine IN ('yes', 'no', '')),
    on_antipsychotic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antipsychotic IN ('yes', 'no', '')),
    antipsychotic_details TEXT NOT NULL DEFAULT '',
    on_benzodiazepine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_benzodiazepine IN ('yes', 'no', '')),
    benzodiazepine_details TEXT NOT NULL DEFAULT '',
    on_antidepressant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antidepressant IN ('yes', 'no', '')),
    antidepressant_details TEXT NOT NULL DEFAULT '',
    on_melatonin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_melatonin IN ('yes', 'no', '')),
    melatonin_dose TEXT NOT NULL DEFAULT '',
    on_analgesic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_analgesic IN ('yes', 'no', '')),
    analgesic_details TEXT NOT NULL DEFAULT '',
    anticholinergic_burden VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anticholinergic_burden IN ('none', 'low', 'moderate', 'high', '')),
    polypharmacy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polypharmacy IN ('yes', 'no', '')),
    total_medications INTEGER
        CHECK (total_medications IS NULL OR total_medications >= 0),
    recent_medication_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_medication_changes IN ('yes', 'no', '')),
    recent_medication_changes_details TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'moderate', 'poor', '')),
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medication_review_updated_at
    BEFORE UPDATE ON assessment_medication_review
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication_review IS
    'Medication review section: dementia medications, psychotropics, anticholinergic burden, and polypharmacy. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medication_review.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medication_review.on_cholinesterase_inhibitor IS
    'Whether the patient is on a cholinesterase inhibitor (e.g. donepezil, rivastigmine): yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.cholinesterase_inhibitor_details IS
    'Details of cholinesterase inhibitor therapy including drug and dose.';
COMMENT ON COLUMN assessment_medication_review.on_memantine IS
    'Whether the patient is on memantine: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.on_antipsychotic IS
    'Whether the patient is on an antipsychotic: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.antipsychotic_details IS
    'Details of antipsychotic therapy including drug, dose, and indication.';
COMMENT ON COLUMN assessment_medication_review.on_benzodiazepine IS
    'Whether the patient is on a benzodiazepine: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.benzodiazepine_details IS
    'Details of benzodiazepine therapy.';
COMMENT ON COLUMN assessment_medication_review.on_antidepressant IS
    'Whether the patient is on an antidepressant: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.antidepressant_details IS
    'Details of antidepressant therapy.';
COMMENT ON COLUMN assessment_medication_review.on_melatonin IS
    'Whether the patient is on melatonin: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.melatonin_dose IS
    'Melatonin dose and timing details.';
COMMENT ON COLUMN assessment_medication_review.on_analgesic IS
    'Whether the patient is on regular analgesics: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.analgesic_details IS
    'Details of analgesic therapy.';
COMMENT ON COLUMN assessment_medication_review.anticholinergic_burden IS
    'Anticholinergic medication burden: none, low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_medication_review.polypharmacy IS
    'Whether the patient is on 5 or more regular medications (polypharmacy): yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.total_medications IS
    'Total number of regular medications.';
COMMENT ON COLUMN assessment_medication_review.recent_medication_changes IS
    'Whether there have been recent medication changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_medication_review.recent_medication_changes_details IS
    'Details of recent medication changes.';
COMMENT ON COLUMN assessment_medication_review.medication_adherence IS
    'Medication adherence: good, moderate, poor, or empty.';
COMMENT ON COLUMN assessment_medication_review.medication_notes IS
    'Additional clinician notes on medications.';
