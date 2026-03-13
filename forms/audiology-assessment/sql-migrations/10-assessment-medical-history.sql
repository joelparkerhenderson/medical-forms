-- 10_assessment_medical_history.sql
-- Medical history section of the audiology assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    has_cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiovascular_disease IN ('yes', 'no', '')),
    has_autoimmune_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autoimmune_condition IN ('yes', 'no', '')),
    autoimmune_details TEXT NOT NULL DEFAULT '',
    has_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_kidney_disease IN ('yes', 'no', '')),
    has_neurological_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_neurological_condition IN ('yes', 'no', '')),
    neurological_details TEXT NOT NULL DEFAULT '',
    current_medications TEXT NOT NULL DEFAULT '',
    ototoxic_medications TEXT NOT NULL DEFAULT '',
    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    other_medical_history TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: conditions that may affect hearing or be associated with hearing loss. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_diabetes IS
    'Whether the patient has diabetes (associated with hearing loss).';
COMMENT ON COLUMN assessment_medical_history.has_cardiovascular_disease IS
    'Whether the patient has cardiovascular disease (affects cochlear blood supply).';
COMMENT ON COLUMN assessment_medical_history.has_autoimmune_condition IS
    'Whether the patient has an autoimmune condition (e.g. autoimmune inner ear disease).';
COMMENT ON COLUMN assessment_medical_history.autoimmune_details IS
    'Details of autoimmune conditions.';
COMMENT ON COLUMN assessment_medical_history.has_kidney_disease IS
    'Whether the patient has kidney disease (associated with sensorineural hearing loss).';
COMMENT ON COLUMN assessment_medical_history.has_neurological_condition IS
    'Whether the patient has a neurological condition (e.g. acoustic neuroma, multiple sclerosis).';
COMMENT ON COLUMN assessment_medical_history.neurological_details IS
    'Details of neurological conditions.';
COMMENT ON COLUMN assessment_medical_history.current_medications IS
    'Free-text list of all current medications.';
COMMENT ON COLUMN assessment_medical_history.ototoxic_medications IS
    'Current ototoxic medications (e.g. aminoglycosides, loop diuretics, cisplatin, aspirin).';
COMMENT ON COLUMN assessment_medical_history.has_drug_allergies IS
    'Whether the patient has drug allergies.';
COMMENT ON COLUMN assessment_medical_history.drug_allergy_details IS
    'Details of drug allergies.';
COMMENT ON COLUMN assessment_medical_history.other_medical_history IS
    'Other relevant medical history.';
