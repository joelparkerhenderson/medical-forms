-- 06_assessment_medical_history.sql
-- Medical history section of the patient intake assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_chronic_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_chronic_conditions IN ('yes', 'no', '')),
    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type-1', 'type-2', 'gestational', '')),
    has_hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hypertension IN ('yes', 'no', '')),
    has_heart_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_heart_disease IN ('yes', 'no', '')),
    heart_disease_details TEXT NOT NULL DEFAULT '',
    has_lung_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_lung_disease IN ('yes', 'no', '')),
    lung_disease_details TEXT NOT NULL DEFAULT '',
    has_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_kidney_disease IN ('yes', 'no', '')),
    has_liver_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_liver_disease IN ('yes', 'no', '')),
    has_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cancer IN ('yes', 'no', '')),
    cancer_details TEXT NOT NULL DEFAULT '',
    has_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_stroke IN ('yes', 'no', '')),
    has_epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_epilepsy IN ('yes', 'no', '')),
    has_mental_health_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_mental_health_condition IN ('yes', 'no', '')),
    mental_health_details TEXT NOT NULL DEFAULT '',
    has_autoimmune_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autoimmune_disease IN ('yes', 'no', '')),
    autoimmune_disease_details TEXT NOT NULL DEFAULT '',
    has_previous_surgeries VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_previous_surgeries IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    has_hospitalisations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hospitalisations IN ('yes', 'no', '')),
    hospitalisation_details TEXT NOT NULL DEFAULT '',
    other_conditions TEXT NOT NULL DEFAULT '',
    medical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: chronic conditions, previous surgeries, and hospitalisations. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_chronic_conditions IS
    'Whether the patient has any chronic conditions: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_diabetes IS
    'Whether the patient has diabetes: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.diabetes_type IS
    'Type of diabetes: type-1, type-2, gestational, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_hypertension IS
    'Whether the patient has hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_heart_disease IS
    'Whether the patient has heart disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.heart_disease_details IS
    'Details of heart disease if present.';
COMMENT ON COLUMN assessment_medical_history.has_lung_disease IS
    'Whether the patient has lung disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.lung_disease_details IS
    'Details of lung disease if present.';
COMMENT ON COLUMN assessment_medical_history.has_kidney_disease IS
    'Whether the patient has kidney disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_liver_disease IS
    'Whether the patient has liver disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_cancer IS
    'Whether the patient has or has had cancer: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.cancer_details IS
    'Details of cancer diagnosis if present.';
COMMENT ON COLUMN assessment_medical_history.has_stroke IS
    'Whether the patient has had a stroke or TIA: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_epilepsy IS
    'Whether the patient has epilepsy: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_mental_health_condition IS
    'Whether the patient has a mental health condition: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.mental_health_details IS
    'Details of mental health conditions.';
COMMENT ON COLUMN assessment_medical_history.has_autoimmune_disease IS
    'Whether the patient has an autoimmune disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.autoimmune_disease_details IS
    'Details of autoimmune disease if present.';
COMMENT ON COLUMN assessment_medical_history.has_previous_surgeries IS
    'Whether the patient has had previous surgeries: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.surgery_details IS
    'Details of previous surgeries.';
COMMENT ON COLUMN assessment_medical_history.has_hospitalisations IS
    'Whether the patient has had recent hospitalisations: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.hospitalisation_details IS
    'Details of recent hospitalisations.';
COMMENT ON COLUMN assessment_medical_history.other_conditions IS
    'Other medical conditions not listed above.';
COMMENT ON COLUMN assessment_medical_history.medical_history_notes IS
    'Additional notes on medical history.';
