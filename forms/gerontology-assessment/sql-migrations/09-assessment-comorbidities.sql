-- 09_assessment_comorbidities.sql
-- Comorbidities section of the gerontology assessment.

CREATE TABLE assessment_comorbidities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hypertension IN ('yes', 'no', '')),
    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type-1', 'type-2', '')),
    has_heart_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_heart_failure IN ('yes', 'no', '')),
    has_atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_atrial_fibrillation IN ('yes', 'no', '')),
    has_copd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_copd IN ('yes', 'no', '')),
    has_osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_osteoporosis IN ('yes', 'no', '')),
    has_osteoarthritis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_osteoarthritis IN ('yes', 'no', '')),
    has_chronic_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_chronic_kidney_disease IN ('yes', 'no', '')),
    ckd_stage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ckd_stage IN ('1', '2', '3a', '3b', '4', '5', '')),
    has_stroke_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_stroke_history IN ('yes', 'no', '')),
    has_parkinson_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_parkinson_disease IN ('yes', 'no', '')),
    has_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cancer IN ('yes', 'no', '')),
    cancer_details TEXT NOT NULL DEFAULT '',
    charlson_comorbidity_index INTEGER
        CHECK (charlson_comorbidity_index IS NULL OR charlson_comorbidity_index >= 0),
    other_comorbidities TEXT NOT NULL DEFAULT '',
    comorbidity_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_comorbidities_updated_at
    BEFORE UPDATE ON assessment_comorbidities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_comorbidities IS
    'Comorbidities section: major chronic conditions and Charlson Comorbidity Index. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_comorbidities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_comorbidities.has_hypertension IS
    'Whether the patient has hypertension: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_diabetes IS
    'Whether the patient has diabetes: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.diabetes_type IS
    'Type of diabetes: type-1, type-2, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_heart_failure IS
    'Whether the patient has heart failure: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_atrial_fibrillation IS
    'Whether the patient has atrial fibrillation: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_copd IS
    'Whether the patient has COPD: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_osteoporosis IS
    'Whether the patient has osteoporosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_osteoarthritis IS
    'Whether the patient has osteoarthritis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_chronic_kidney_disease IS
    'Whether the patient has chronic kidney disease: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.ckd_stage IS
    'CKD stage: 1, 2, 3a, 3b, 4, 5, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_stroke_history IS
    'Whether the patient has a history of stroke or TIA: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_parkinson_disease IS
    'Whether the patient has Parkinson disease: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.has_cancer IS
    'Whether the patient has or has had cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_comorbidities.cancer_details IS
    'Details of cancer diagnosis and treatment.';
COMMENT ON COLUMN assessment_comorbidities.charlson_comorbidity_index IS
    'Charlson Comorbidity Index score, NULL if not calculated.';
COMMENT ON COLUMN assessment_comorbidities.other_comorbidities IS
    'Free-text list of other comorbidities.';
COMMENT ON COLUMN assessment_comorbidities.comorbidity_notes IS
    'Free-text notes on comorbidities.';
