-- 04_assessment_cancer_diagnosis.sql
-- Cancer diagnosis section of the oncology assessment.

CREATE TABLE assessment_cancer_diagnosis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cancer_type VARCHAR(255) NOT NULL DEFAULT '',
    cancer_site VARCHAR(255) NOT NULL DEFAULT '',
    histology VARCHAR(255) NOT NULL DEFAULT '',
    histology_other VARCHAR(255) NOT NULL DEFAULT '',
    date_of_diagnosis DATE,
    stage VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stage IN ('0', 'I', 'IA', 'IB', 'II', 'IIA', 'IIB', 'III', 'IIIA', 'IIIB', 'IIIC', 'IV', 'IVA', 'IVB', 'unknown', '')),
    tnm_t VARCHAR(10) NOT NULL DEFAULT '',
    tnm_n VARCHAR(10) NOT NULL DEFAULT '',
    tnm_m VARCHAR(10) NOT NULL DEFAULT '',
    grade VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (grade IN ('well-differentiated', 'moderately-differentiated', 'poorly-differentiated', 'undifferentiated', 'unknown', '')),
    laterality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (laterality IN ('left', 'right', 'bilateral', 'not-applicable', '')),
    metastatic_sites TEXT NOT NULL DEFAULT '',
    biomarkers TEXT NOT NULL DEFAULT '',
    genetic_mutations TEXT NOT NULL DEFAULT '',
    diagnosis_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cancer_diagnosis_updated_at
    BEFORE UPDATE ON assessment_cancer_diagnosis
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cancer_diagnosis IS
    'Cancer diagnosis section: type, site, staging, histology, and molecular markers. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cancer_diagnosis.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cancer_diagnosis.cancer_type IS
    'Type of cancer (e.g. carcinoma, sarcoma, lymphoma, leukaemia).';
COMMENT ON COLUMN assessment_cancer_diagnosis.cancer_site IS
    'Primary anatomical site of the cancer.';
COMMENT ON COLUMN assessment_cancer_diagnosis.histology IS
    'Histological subtype of the tumour (select value).';
COMMENT ON COLUMN assessment_cancer_diagnosis.histology_other IS
    'Free-text histology when histology is other.';
COMMENT ON COLUMN assessment_cancer_diagnosis.date_of_diagnosis IS
    'Date when the cancer was first diagnosed.';
COMMENT ON COLUMN assessment_cancer_diagnosis.stage IS
    'Overall cancer stage (AJCC/TNM staging system): 0 through IV with sub-stages, unknown, or empty.';
COMMENT ON COLUMN assessment_cancer_diagnosis.tnm_t IS
    'TNM T component: primary tumour classification.';
COMMENT ON COLUMN assessment_cancer_diagnosis.tnm_n IS
    'TNM N component: regional lymph node involvement.';
COMMENT ON COLUMN assessment_cancer_diagnosis.tnm_m IS
    'TNM M component: distant metastasis classification.';
COMMENT ON COLUMN assessment_cancer_diagnosis.grade IS
    'Tumour differentiation grade: well, moderately, poorly differentiated, undifferentiated, unknown, or empty.';
COMMENT ON COLUMN assessment_cancer_diagnosis.laterality IS
    'Laterality if applicable: left, right, bilateral, not-applicable, or empty.';
COMMENT ON COLUMN assessment_cancer_diagnosis.metastatic_sites IS
    'Description of known metastatic sites.';
COMMENT ON COLUMN assessment_cancer_diagnosis.biomarkers IS
    'Relevant biomarker results (e.g. HER2, ER, PR, PD-L1).';
COMMENT ON COLUMN assessment_cancer_diagnosis.genetic_mutations IS
    'Known genetic mutations (e.g. BRCA1/2, EGFR, ALK, KRAS).';
COMMENT ON COLUMN assessment_cancer_diagnosis.diagnosis_notes IS
    'Additional notes on cancer diagnosis.';
