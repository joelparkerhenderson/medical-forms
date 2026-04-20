-- 05_assessment_medical_history.sql
-- Medical history section of the organ donation assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    hypertension_duration_years INTEGER
        CHECK (hypertension_duration_years IS NULL OR hypertension_duration_years >= 0),
    diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type1', 'type2', '')),
    diabetes_duration_years INTEGER
        CHECK (diabetes_duration_years IS NULL OR diabetes_duration_years >= 0),
    malignancy_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (malignancy_history IN ('yes', 'no', '')),
    malignancy_details TEXT NOT NULL DEFAULT '',
    malignancy_remission_years INTEGER
        CHECK (malignancy_remission_years IS NULL OR malignancy_remission_years >= 0),
    autoimmune_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (autoimmune_disease IN ('yes', 'no', '')),
    autoimmune_details TEXT NOT NULL DEFAULT '',
    smoking VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking IN ('current', 'ex', 'never', '')),
    smoking_pack_years INTEGER
        CHECK (smoking_pack_years IS NULL OR smoking_pack_years >= 0),
    alcohol VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol IN ('none', 'occasional', 'moderate', 'heavy', '')),
    iv_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (iv_drug_use IN ('yes', 'no', '')),
    previous_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_surgery IN ('yes', 'no', '')),
    previous_surgery_details TEXT NOT NULL DEFAULT '',
    medical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: comorbidities, malignancy, substance use, and surgical history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.hypertension IS
    'Whether the donor has hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.hypertension_duration_years IS
    'Duration of hypertension in years.';
COMMENT ON COLUMN assessment_medical_history.diabetes IS
    'Whether the donor has diabetes: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.diabetes_type IS
    'Type of diabetes: type1, type2, or empty.';
COMMENT ON COLUMN assessment_medical_history.diabetes_duration_years IS
    'Duration of diabetes in years.';
COMMENT ON COLUMN assessment_medical_history.malignancy_history IS
    'Whether the donor has a history of malignancy: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.malignancy_details IS
    'Details of malignancy history including type, stage, and treatment.';
COMMENT ON COLUMN assessment_medical_history.malignancy_remission_years IS
    'Years since malignancy remission.';
COMMENT ON COLUMN assessment_medical_history.autoimmune_disease IS
    'Whether the donor has autoimmune disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.autoimmune_details IS
    'Details of autoimmune disease.';
COMMENT ON COLUMN assessment_medical_history.smoking IS
    'Smoking status: current, ex, never, or empty.';
COMMENT ON COLUMN assessment_medical_history.smoking_pack_years IS
    'Pack years of smoking.';
COMMENT ON COLUMN assessment_medical_history.alcohol IS
    'Alcohol consumption: none, occasional, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_medical_history.iv_drug_use IS
    'Whether the donor has a history of intravenous drug use: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.previous_surgery IS
    'Whether the donor has had previous surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.previous_surgery_details IS
    'Details of previous surgical procedures.';
COMMENT ON COLUMN assessment_medical_history.medical_history_notes IS
    'Additional clinician notes on medical history.';
