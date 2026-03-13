-- 09_assessment_family_history.sql
-- Family history section of the patient intake assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_heart_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_heart_disease IN ('yes', 'no', '')),
    family_history_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_stroke IN ('yes', 'no', '')),
    family_history_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_diabetes IN ('yes', 'no', '')),
    family_history_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cancer IN ('yes', 'no', '')),
    family_cancer_details TEXT NOT NULL DEFAULT '',
    family_history_hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_hypertension IN ('yes', 'no', '')),
    family_history_mental_health VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_mental_health IN ('yes', 'no', '')),
    family_mental_health_details TEXT NOT NULL DEFAULT '',
    family_history_autoimmune VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_autoimmune IN ('yes', 'no', '')),
    family_history_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_kidney_disease IN ('yes', 'no', '')),
    family_history_lung_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_lung_disease IN ('yes', 'no', '')),
    family_history_genetic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_genetic IN ('yes', 'no', '')),
    family_genetic_details TEXT NOT NULL DEFAULT '',
    other_family_history TEXT NOT NULL DEFAULT '',
    family_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_history_updated_at
    BEFORE UPDATE ON assessment_family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_history IS
    'Family history section: hereditary conditions in first-degree relatives. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_history_heart_disease IS
    'Family history of heart disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_stroke IS
    'Family history of stroke: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_diabetes IS
    'Family history of diabetes: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_cancer IS
    'Family history of cancer: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_cancer_details IS
    'Details of family cancer history including type and relation.';
COMMENT ON COLUMN assessment_family_history.family_history_hypertension IS
    'Family history of hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_mental_health IS
    'Family history of mental health conditions: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_mental_health_details IS
    'Details of family mental health history.';
COMMENT ON COLUMN assessment_family_history.family_history_autoimmune IS
    'Family history of autoimmune disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_kidney_disease IS
    'Family history of kidney disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_lung_disease IS
    'Family history of lung disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_history_genetic IS
    'Family history of genetic conditions: yes, no, or empty.';
COMMENT ON COLUMN assessment_family_history.family_genetic_details IS
    'Details of family genetic conditions.';
COMMENT ON COLUMN assessment_family_history.other_family_history IS
    'Other family history not listed above.';
COMMENT ON COLUMN assessment_family_history.family_history_notes IS
    'Additional notes on family history.';
