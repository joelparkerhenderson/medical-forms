-- 10_assessment_medical_history.sql
-- Medical history section of the urology assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Urological history
    previous_urological_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_urological_surgery IN ('yes', 'no', '')),
    urological_surgery_details TEXT NOT NULL DEFAULT '',
    benign_prostatic_hyperplasia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (benign_prostatic_hyperplasia IN ('yes', 'no', '')),
    prostate_cancer_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (prostate_cancer_history IN ('yes', 'no', '')),
    prostate_cancer_details TEXT NOT NULL DEFAULT '',
    bladder_cancer_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bladder_cancer_history IN ('yes', 'no', '')),
    kidney_stones_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (kidney_stones_history IN ('yes', 'no', '')),
    kidney_stones_details TEXT NOT NULL DEFAULT '',
    catheterisation_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (catheterisation_history IN ('yes', 'no', '')),

    -- General medical history
    diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('yes', 'no', '')),
    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiovascular_disease IN ('yes', 'no', '')),
    neurological_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neurological_disease IN ('yes', 'no', '')),
    neurological_disease_details TEXT NOT NULL DEFAULT '',
    chronic_kidney_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_kidney_disease IN ('yes', 'no', '')),
    previous_pelvic_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_pelvic_surgery IN ('yes', 'no', '')),
    pelvic_surgery_details TEXT NOT NULL DEFAULT '',
    previous_radiotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_radiotherapy IN ('yes', 'no', '')),
    radiotherapy_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: urological and general medical history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.previous_urological_surgery IS
    'Whether patient has had previous urological surgery.';
COMMENT ON COLUMN assessment_medical_history.urological_surgery_details IS
    'Details of previous urological surgeries.';
COMMENT ON COLUMN assessment_medical_history.benign_prostatic_hyperplasia IS
    'Whether patient has diagnosed benign prostatic hyperplasia (BPH).';
COMMENT ON COLUMN assessment_medical_history.prostate_cancer_history IS
    'Whether patient has a history of prostate cancer.';
COMMENT ON COLUMN assessment_medical_history.prostate_cancer_details IS
    'Details of prostate cancer history.';
COMMENT ON COLUMN assessment_medical_history.bladder_cancer_history IS
    'Whether patient has a history of bladder cancer.';
COMMENT ON COLUMN assessment_medical_history.kidney_stones_history IS
    'Whether patient has a history of kidney stones (nephrolithiasis).';
COMMENT ON COLUMN assessment_medical_history.kidney_stones_details IS
    'Details of kidney stone history.';
COMMENT ON COLUMN assessment_medical_history.catheterisation_history IS
    'Whether patient has a history of urinary catheterisation.';
COMMENT ON COLUMN assessment_medical_history.diabetes IS
    'Whether patient has diabetes (affects bladder function and infection risk).';
COMMENT ON COLUMN assessment_medical_history.hypertension IS
    'Whether patient has hypertension.';
COMMENT ON COLUMN assessment_medical_history.cardiovascular_disease IS
    'Whether patient has cardiovascular disease.';
COMMENT ON COLUMN assessment_medical_history.neurological_disease IS
    'Whether patient has neurological disease (can cause neurogenic bladder).';
COMMENT ON COLUMN assessment_medical_history.neurological_disease_details IS
    'Details of neurological disease.';
COMMENT ON COLUMN assessment_medical_history.chronic_kidney_disease IS
    'Whether patient has chronic kidney disease.';
COMMENT ON COLUMN assessment_medical_history.previous_pelvic_surgery IS
    'Whether patient has had previous pelvic surgery.';
COMMENT ON COLUMN assessment_medical_history.pelvic_surgery_details IS
    'Details of previous pelvic surgery.';
COMMENT ON COLUMN assessment_medical_history.previous_radiotherapy IS
    'Whether patient has had previous pelvic radiotherapy.';
COMMENT ON COLUMN assessment_medical_history.radiotherapy_details IS
    'Details of previous radiotherapy.';
