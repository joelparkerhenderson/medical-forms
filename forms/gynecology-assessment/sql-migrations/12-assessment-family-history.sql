-- 12_assessment_family_history.sql
-- Family history section of the gynaecology assessment.

CREATE TABLE assessment_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    family_history_breast_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_breast_cancer IN ('yes', 'no', '')),
    breast_cancer_details TEXT NOT NULL DEFAULT '',
    family_history_ovarian_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_ovarian_cancer IN ('yes', 'no', '')),
    ovarian_cancer_details TEXT NOT NULL DEFAULT '',
    family_history_endometrial_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_endometrial_cancer IN ('yes', 'no', '')),
    endometrial_cancer_details TEXT NOT NULL DEFAULT '',
    family_history_cervical_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_cervical_cancer IN ('yes', 'no', '')),
    family_history_endometriosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_endometriosis IN ('yes', 'no', '')),
    family_history_fibroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_fibroids IN ('yes', 'no', '')),
    family_history_pcos VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_pcos IN ('yes', 'no', '')),
    family_history_early_menopause VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_early_menopause IN ('yes', 'no', '')),
    family_history_osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_osteoporosis IN ('yes', 'no', '')),
    family_history_thromboembolism VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_thromboembolism IN ('yes', 'no', '')),
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
    'Family history section: gynaecological cancers, endometriosis, PCOS, and other hereditary conditions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_family_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_family_history.family_history_breast_cancer IS
    'Whether there is a family history of breast cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.breast_cancer_details IS
    'Details of family breast cancer (relationship, age at diagnosis).';
COMMENT ON COLUMN assessment_family_history.family_history_ovarian_cancer IS
    'Whether there is a family history of ovarian cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.ovarian_cancer_details IS
    'Details of family ovarian cancer.';
COMMENT ON COLUMN assessment_family_history.family_history_endometrial_cancer IS
    'Whether there is a family history of endometrial cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.endometrial_cancer_details IS
    'Details of family endometrial cancer.';
COMMENT ON COLUMN assessment_family_history.family_history_cervical_cancer IS
    'Whether there is a family history of cervical cancer: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.family_history_endometriosis IS
    'Whether there is a family history of endometriosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.family_history_fibroids IS
    'Whether there is a family history of uterine fibroids: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.family_history_pcos IS
    'Whether there is a family history of PCOS: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.family_history_early_menopause IS
    'Whether there is a family history of early menopause (before age 45): yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.family_history_osteoporosis IS
    'Whether there is a family history of osteoporosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.family_history_thromboembolism IS
    'Whether there is a family history of venous thromboembolism: yes, no, or empty string.';
COMMENT ON COLUMN assessment_family_history.other_family_history IS
    'Free-text description of other relevant family history.';
COMMENT ON COLUMN assessment_family_history.family_history_notes IS
    'Free-text notes on family history.';
