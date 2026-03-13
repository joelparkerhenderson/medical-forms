-- 05_assessment_personal_medical_history.sql
-- Personal medical history section of the genetic assessment.

CREATE TABLE assessment_personal_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_cancer_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cancer_diagnosis IN ('yes', 'no', '')),
    cancer_type VARCHAR(255) NOT NULL DEFAULT '',
    cancer_age_at_diagnosis INTEGER
        CHECK (cancer_age_at_diagnosis IS NULL OR (cancer_age_at_diagnosis >= 0 AND cancer_age_at_diagnosis <= 120)),
    cancer_treatment_details TEXT NOT NULL DEFAULT '',
    has_cardiovascular_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiovascular_condition IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    has_neurological_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_neurological_condition IN ('yes', 'no', '')),
    neurological_details TEXT NOT NULL DEFAULT '',
    has_congenital_anomalies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_congenital_anomalies IN ('yes', 'no', '')),
    congenital_anomaly_details TEXT NOT NULL DEFAULT '',
    has_intellectual_disability VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_intellectual_disability IN ('yes', 'no', '')),
    intellectual_disability_details TEXT NOT NULL DEFAULT '',
    other_significant_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_personal_medical_history_updated_at
    BEFORE UPDATE ON assessment_personal_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_personal_medical_history IS
    'Personal medical history section: cancer, cardiovascular, neurological, and congenital conditions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_personal_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_personal_medical_history.has_cancer_diagnosis IS
    'Whether the patient has a personal cancer diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_personal_medical_history.cancer_type IS
    'Type of cancer diagnosed (e.g. breast, ovarian, colorectal).';
COMMENT ON COLUMN assessment_personal_medical_history.cancer_age_at_diagnosis IS
    'Age at cancer diagnosis in years, NULL if unanswered.';
COMMENT ON COLUMN assessment_personal_medical_history.cancer_treatment_details IS
    'Details of cancer treatment received.';
COMMENT ON COLUMN assessment_personal_medical_history.has_cardiovascular_condition IS
    'Whether the patient has a cardiovascular genetic condition: yes, no, or empty string.';
COMMENT ON COLUMN assessment_personal_medical_history.cardiovascular_details IS
    'Details of cardiovascular genetic conditions.';
COMMENT ON COLUMN assessment_personal_medical_history.has_neurological_condition IS
    'Whether the patient has a neurogenetic condition: yes, no, or empty string.';
COMMENT ON COLUMN assessment_personal_medical_history.neurological_details IS
    'Details of neurogenetic conditions.';
COMMENT ON COLUMN assessment_personal_medical_history.has_congenital_anomalies IS
    'Whether the patient has congenital anomalies: yes, no, or empty string.';
COMMENT ON COLUMN assessment_personal_medical_history.congenital_anomaly_details IS
    'Details of congenital anomalies.';
COMMENT ON COLUMN assessment_personal_medical_history.has_intellectual_disability IS
    'Whether the patient has an intellectual disability: yes, no, or empty string.';
COMMENT ON COLUMN assessment_personal_medical_history.intellectual_disability_details IS
    'Details of intellectual disability.';
COMMENT ON COLUMN assessment_personal_medical_history.other_significant_conditions IS
    'Free-text description of other significant medical conditions.';
