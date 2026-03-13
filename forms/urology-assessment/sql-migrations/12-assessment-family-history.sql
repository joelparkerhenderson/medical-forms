-- 12_assessment_family_history.sql
-- Family history section of the urology assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_prostate_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_prostate_cancer IN ('yes', 'no', '')),
    prostate_cancer_relationship TEXT NOT NULL DEFAULT '',
    prostate_cancer_age_at_diagnosis INTEGER
        CHECK (prostate_cancer_age_at_diagnosis IS NULL OR (prostate_cancer_age_at_diagnosis >= 0 AND prostate_cancer_age_at_diagnosis <= 120)),
    family_history_bladder_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_bladder_cancer IN ('yes', 'no', '')),
    family_history_kidney_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_kidney_cancer IN ('yes', 'no', '')),
    family_history_kidney_stones VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_kidney_stones IN ('yes', 'no', '')),
    family_history_bph VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_bph IN ('yes', 'no', '')),
    family_history_brca_mutation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_brca_mutation IN ('yes', 'no', '')),
    family_history_breast_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_breast_cancer IN ('yes', 'no', '')),
    additional_family_history TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_family_history_updated_at
    BEFORE UPDATE ON assessment_family_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_family_history IS
    'Family history section: urological and oncological family history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_history_prostate_cancer IS
    'Whether there is a family history of prostate cancer (increases screening urgency).';
COMMENT ON COLUMN assessment_family_history.prostate_cancer_relationship IS
    'Relationship to family member with prostate cancer (e.g. father, brother).';
COMMENT ON COLUMN assessment_family_history.prostate_cancer_age_at_diagnosis IS
    'Age at diagnosis of the affected family member.';
COMMENT ON COLUMN assessment_family_history.family_history_bladder_cancer IS
    'Whether there is a family history of bladder cancer.';
COMMENT ON COLUMN assessment_family_history.family_history_kidney_cancer IS
    'Whether there is a family history of kidney cancer.';
COMMENT ON COLUMN assessment_family_history.family_history_kidney_stones IS
    'Whether there is a family history of kidney stones.';
COMMENT ON COLUMN assessment_family_history.family_history_bph IS
    'Whether there is a family history of benign prostatic hyperplasia.';
COMMENT ON COLUMN assessment_family_history.family_history_brca_mutation IS
    'Whether there is a family history of BRCA gene mutation (associated with prostate cancer risk).';
COMMENT ON COLUMN assessment_family_history.family_history_breast_cancer IS
    'Whether there is a family history of breast cancer (BRCA link to prostate cancer).';
COMMENT ON COLUMN assessment_family_history.additional_family_history IS
    'Free-text additional family history notes.';
