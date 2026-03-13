-- 09_assessment_neurogenetics.sql
-- Neurogenetics section of the genetic assessment.

CREATE TABLE assessment_neurogenetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_huntington VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_huntington IN ('yes', 'no', '')),
    huntington_details TEXT NOT NULL DEFAULT '',
    family_history_early_onset_dementia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_early_onset_dementia IN ('yes', 'no', '')),
    dementia_type VARCHAR(100) NOT NULL DEFAULT '',
    dementia_age_at_onset INTEGER
        CHECK (dementia_age_at_onset IS NULL OR (dementia_age_at_onset >= 0 AND dementia_age_at_onset <= 120)),
    family_history_motor_neurone_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_motor_neurone_disease IN ('yes', 'no', '')),
    motor_neurone_details TEXT NOT NULL DEFAULT '',
    family_history_hereditary_neuropathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_hereditary_neuropathy IN ('yes', 'no', '')),
    hereditary_neuropathy_details TEXT NOT NULL DEFAULT '',
    family_history_epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_epilepsy IN ('yes', 'no', '')),
    epilepsy_details TEXT NOT NULL DEFAULT '',
    family_history_ataxia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_ataxia IN ('yes', 'no', '')),
    ataxia_details TEXT NOT NULL DEFAULT '',
    neurogenetics_risk_score INTEGER
        CHECK (neurogenetics_risk_score IS NULL OR (neurogenetics_risk_score >= 0 AND neurogenetics_risk_score <= 10)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_neurogenetics_updated_at
    BEFORE UPDATE ON assessment_neurogenetics
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_neurogenetics IS
    'Neurogenetics section: Huntington disease, early-onset dementia, motor neurone disease, hereditary neuropathy, epilepsy, and ataxia. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_neurogenetics.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_neurogenetics.family_history_huntington IS
    'Whether there is a family history of Huntington disease: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurogenetics.huntington_details IS
    'Details of Huntington disease in the family.';
COMMENT ON COLUMN assessment_neurogenetics.family_history_early_onset_dementia IS
    'Whether there is a family history of early-onset dementia (before age 65): yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurogenetics.dementia_type IS
    'Type of dementia (e.g. Alzheimer, frontotemporal, Lewy body).';
COMMENT ON COLUMN assessment_neurogenetics.dementia_age_at_onset IS
    'Age at onset of dementia in years, NULL if unknown.';
COMMENT ON COLUMN assessment_neurogenetics.family_history_motor_neurone_disease IS
    'Whether there is a family history of motor neurone disease (ALS/MND): yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurogenetics.motor_neurone_details IS
    'Details of motor neurone disease in the family.';
COMMENT ON COLUMN assessment_neurogenetics.family_history_hereditary_neuropathy IS
    'Whether there is a family history of hereditary neuropathy (e.g. CMT): yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurogenetics.hereditary_neuropathy_details IS
    'Details of hereditary neuropathy.';
COMMENT ON COLUMN assessment_neurogenetics.family_history_epilepsy IS
    'Whether there is a family history of genetic epilepsy: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurogenetics.epilepsy_details IS
    'Details of familial epilepsy.';
COMMENT ON COLUMN assessment_neurogenetics.family_history_ataxia IS
    'Whether there is a family history of hereditary ataxia: yes, no, or empty string.';
COMMENT ON COLUMN assessment_neurogenetics.ataxia_details IS
    'Details of hereditary ataxia.';
COMMENT ON COLUMN assessment_neurogenetics.neurogenetics_risk_score IS
    'Computed neurogenetics risk sub-score, NULL if not yet scored.';
