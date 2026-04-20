-- 09_assessment_current_medications.sql
-- Current medications section of the birth control assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    on_enzyme_inducing_drugs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_enzyme_inducing_drugs IN ('yes', 'no', '')),
    enzyme_inducing_details TEXT NOT NULL DEFAULT '',
    on_anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_details TEXT NOT NULL DEFAULT '',
    on_antiepileptics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antiepileptics IN ('yes', 'no', '')),
    antiepileptic_details TEXT NOT NULL DEFAULT '',
    on_antiretrovirals VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antiretrovirals IN ('yes', 'no', '')),
    antiretroviral_details TEXT NOT NULL DEFAULT '',
    on_antibiotics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antibiotics IN ('yes', 'no', '')),
    antibiotic_details TEXT NOT NULL DEFAULT '',
    on_ssri_snri VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_ssri_snri IN ('yes', 'no', '')),
    ssri_snri_details TEXT NOT NULL DEFAULT '',
    herbal_remedies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (herbal_remedies IN ('yes', 'no', '')),
    herbal_details TEXT NOT NULL DEFAULT '',
    other_medications TEXT NOT NULL DEFAULT '',
    drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: enzyme inducers, anticoagulants, antiepileptics, and drug interactions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.on_enzyme_inducing_drugs IS
    'Whether the patient takes enzyme-inducing drugs (reduces COC/POP efficacy): yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.enzyme_inducing_details IS
    'Details of enzyme-inducing drug use (e.g. rifampicin, carbamazepine, phenytoin).';
COMMENT ON COLUMN assessment_current_medications.on_anticoagulants IS
    'Whether the patient is on anticoagulant therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_details IS
    'Details of anticoagulant therapy.';
COMMENT ON COLUMN assessment_current_medications.on_antiepileptics IS
    'Whether the patient takes antiepileptic medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.antiepileptic_details IS
    'Details of antiepileptic medications.';
COMMENT ON COLUMN assessment_current_medications.on_antiretrovirals IS
    'Whether the patient takes antiretroviral medications: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.antiretroviral_details IS
    'Details of antiretroviral therapy.';
COMMENT ON COLUMN assessment_current_medications.on_antibiotics IS
    'Whether the patient is on antibiotics (rifampicin affects COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.antibiotic_details IS
    'Details of antibiotic use.';
COMMENT ON COLUMN assessment_current_medications.on_ssri_snri IS
    'Whether the patient takes SSRI or SNRI medication: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.ssri_snri_details IS
    'Details of SSRI/SNRI medication.';
COMMENT ON COLUMN assessment_current_medications.herbal_remedies IS
    'Whether the patient takes herbal remedies (St John Wort reduces COC efficacy): yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.herbal_details IS
    'Details of herbal remedies.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of any other current medications.';
COMMENT ON COLUMN assessment_current_medications.drug_allergies IS
    'Whether the patient has any drug allergies: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.drug_allergy_details IS
    'Details of drug allergies including drug name and reaction.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Additional clinician notes on medications.';
