-- 09_assessment_breast_health.sql
-- Breast health section of the HRT assessment.

CREATE TABLE assessment_breast_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    personal_history_breast_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (personal_history_breast_cancer IN ('yes', 'no', '')),
    breast_cancer_details TEXT NOT NULL DEFAULT '',
    breast_cancer_treatment TEXT NOT NULL DEFAULT '',
    family_history_breast_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_breast_cancer IN ('yes', 'no', '')),
    family_breast_cancer_details TEXT NOT NULL DEFAULT '',
    family_history_ovarian_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_ovarian_cancer IN ('yes', 'no', '')),
    known_brca_mutation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_brca_mutation IN ('yes', 'no', 'unknown', '')),
    brca_mutation_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (brca_mutation_type IN ('brca1', 'brca2', 'both', '')),
    mammogram_up_to_date VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mammogram_up_to_date IN ('yes', 'no', '')),
    last_mammogram_date DATE,
    mammogram_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mammogram_result IN ('normal', 'benign', 'suspicious', 'malignant', '')),
    breast_biopsy_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (breast_biopsy_history IN ('yes', 'no', '')),
    breast_biopsy_details TEXT NOT NULL DEFAULT '',
    breast_density VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (breast_density IN ('fatty', 'scattered', 'heterogeneously-dense', 'extremely-dense', '')),
    current_breast_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_breast_symptoms IN ('yes', 'no', '')),
    breast_symptom_details TEXT NOT NULL DEFAULT '',
    breast_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_breast_health_updated_at
    BEFORE UPDATE ON assessment_breast_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_breast_health IS
    'Breast health section: personal and family cancer history, BRCA status, mammogram, and breast density. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_breast_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_breast_health.personal_history_breast_cancer IS
    'Whether the patient has a personal history of breast cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_breast_health.breast_cancer_details IS
    'Details of personal breast cancer history.';
COMMENT ON COLUMN assessment_breast_health.breast_cancer_treatment IS
    'Details of breast cancer treatment received.';
COMMENT ON COLUMN assessment_breast_health.family_history_breast_cancer IS
    'Whether there is a family history of breast cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_breast_health.family_breast_cancer_details IS
    'Details of family breast cancer (relationship, age at diagnosis).';
COMMENT ON COLUMN assessment_breast_health.family_history_ovarian_cancer IS
    'Whether there is a family history of ovarian cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_breast_health.known_brca_mutation IS
    'Whether a BRCA gene mutation is known: yes, no, unknown, or empty string.';
COMMENT ON COLUMN assessment_breast_health.brca_mutation_type IS
    'BRCA mutation type: brca1, brca2, both, or empty string.';
COMMENT ON COLUMN assessment_breast_health.mammogram_up_to_date IS
    'Whether mammogram screening is up to date: yes, no, or empty string.';
COMMENT ON COLUMN assessment_breast_health.last_mammogram_date IS
    'Date of last mammogram, NULL if never performed.';
COMMENT ON COLUMN assessment_breast_health.mammogram_result IS
    'Result of last mammogram: normal, benign, suspicious, malignant, or empty string.';
COMMENT ON COLUMN assessment_breast_health.breast_biopsy_history IS
    'Whether a breast biopsy has been performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_breast_health.breast_biopsy_details IS
    'Details of breast biopsy results.';
COMMENT ON COLUMN assessment_breast_health.breast_density IS
    'Breast density: fatty, scattered, heterogeneously-dense, extremely-dense, or empty string.';
COMMENT ON COLUMN assessment_breast_health.current_breast_symptoms IS
    'Whether current breast symptoms are present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_breast_health.breast_symptom_details IS
    'Details of current breast symptoms.';
COMMENT ON COLUMN assessment_breast_health.breast_health_notes IS
    'Free-text notes on breast health.';
