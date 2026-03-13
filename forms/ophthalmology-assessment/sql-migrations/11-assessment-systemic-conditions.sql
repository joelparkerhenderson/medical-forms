-- 11_assessment_systemic_conditions.sql
-- Systemic conditions section of the ophthalmology assessment.

CREATE TABLE assessment_systemic_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type-1', 'type-2', '')),
    diabetes_duration_years INTEGER
        CHECK (diabetes_duration_years IS NULL OR diabetes_duration_years >= 0),
    hba1c NUMERIC(4,1)
        CHECK (hba1c IS NULL OR hba1c >= 0),
    has_hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hypertension IN ('yes', 'no', '')),
    hypertension_controlled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension_controlled IN ('yes', 'no', '')),
    has_thyroid_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_thyroid_disease IN ('yes', 'no', '')),
    thyroid_disease_details TEXT NOT NULL DEFAULT '',
    has_autoimmune_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autoimmune_disease IN ('yes', 'no', '')),
    autoimmune_disease_details TEXT NOT NULL DEFAULT '',
    has_cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiovascular_disease IN ('yes', 'no', '')),
    cardiovascular_disease_details TEXT NOT NULL DEFAULT '',
    has_neurological_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_neurological_disease IN ('yes', 'no', '')),
    neurological_disease_details TEXT NOT NULL DEFAULT '',
    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'former', 'current', '')),
    other_systemic_conditions TEXT NOT NULL DEFAULT '',
    systemic_conditions_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_systemic_conditions_updated_at
    BEFORE UPDATE ON assessment_systemic_conditions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_systemic_conditions IS
    'Systemic conditions section: diabetes, hypertension, thyroid, autoimmune, cardiovascular, and neurological conditions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_systemic_conditions.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_systemic_conditions.has_diabetes IS
    'Whether the patient has diabetes: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.diabetes_type IS
    'Type of diabetes: type-1, type-2, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.diabetes_duration_years IS
    'Duration of diabetes in years.';
COMMENT ON COLUMN assessment_systemic_conditions.hba1c IS
    'Most recent HbA1c value in mmol/mol.';
COMMENT ON COLUMN assessment_systemic_conditions.has_hypertension IS
    'Whether the patient has hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.hypertension_controlled IS
    'Whether hypertension is controlled: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.has_thyroid_disease IS
    'Whether the patient has thyroid disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.thyroid_disease_details IS
    'Details of thyroid disease (e.g. Graves, hypothyroidism).';
COMMENT ON COLUMN assessment_systemic_conditions.has_autoimmune_disease IS
    'Whether the patient has autoimmune disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.autoimmune_disease_details IS
    'Details of autoimmune disease (e.g. rheumatoid arthritis, lupus, sarcoidosis).';
COMMENT ON COLUMN assessment_systemic_conditions.has_cardiovascular_disease IS
    'Whether the patient has cardiovascular disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.cardiovascular_disease_details IS
    'Details of cardiovascular disease.';
COMMENT ON COLUMN assessment_systemic_conditions.has_neurological_disease IS
    'Whether the patient has neurological disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.neurological_disease_details IS
    'Details of neurological disease (e.g. multiple sclerosis, myasthenia gravis).';
COMMENT ON COLUMN assessment_systemic_conditions.smoking_status IS
    'Smoking status: never, former, current, or empty.';
COMMENT ON COLUMN assessment_systemic_conditions.other_systemic_conditions IS
    'Other systemic conditions not listed above.';
COMMENT ON COLUMN assessment_systemic_conditions.systemic_conditions_notes IS
    'Additional clinician notes on systemic conditions.';
