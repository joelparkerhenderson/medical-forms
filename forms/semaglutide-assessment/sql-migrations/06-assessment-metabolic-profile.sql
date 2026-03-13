-- 06_assessment_metabolic_profile.sql
-- Metabolic profile section of the semaglutide assessment.

CREATE TABLE assessment_metabolic_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    fasting_glucose_mmol_l NUMERIC(5,1)
        CHECK (fasting_glucose_mmol_l IS NULL OR fasting_glucose_mmol_l >= 0),
    hba1c_percent NUMERIC(4,1)
        CHECK (hba1c_percent IS NULL OR (hba1c_percent >= 0 AND hba1c_percent <= 20)),
    hba1c_mmol_mol NUMERIC(5,0)
        CHECK (hba1c_mmol_mol IS NULL OR hba1c_mmol_mol >= 0),
    diabetes_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes_diagnosis IN ('yes', 'no', '')),
    diabetes_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('type1', 'type2', 'pre', '')),
    diabetes_duration_years INTEGER
        CHECK (diabetes_duration_years IS NULL OR diabetes_duration_years >= 0),
    total_cholesterol_mmol_l NUMERIC(4,1)
        CHECK (total_cholesterol_mmol_l IS NULL OR total_cholesterol_mmol_l >= 0),
    ldl_cholesterol_mmol_l NUMERIC(4,1)
        CHECK (ldl_cholesterol_mmol_l IS NULL OR ldl_cholesterol_mmol_l >= 0),
    hdl_cholesterol_mmol_l NUMERIC(4,1)
        CHECK (hdl_cholesterol_mmol_l IS NULL OR hdl_cholesterol_mmol_l >= 0),
    triglycerides_mmol_l NUMERIC(5,1)
        CHECK (triglycerides_mmol_l IS NULL OR triglycerides_mmol_l >= 0),
    insulin_resistance_suspected VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (insulin_resistance_suspected IN ('yes', 'no', '')),
    metabolic_syndrome VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (metabolic_syndrome IN ('yes', 'no', '')),
    thyroid_function_normal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (thyroid_function_normal IN ('yes', 'no', '')),
    tsh_miu_l NUMERIC(6,2)
        CHECK (tsh_miu_l IS NULL OR tsh_miu_l >= 0),
    lab_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_metabolic_profile_updated_at
    BEFORE UPDATE ON assessment_metabolic_profile
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_metabolic_profile IS
    'Metabolic profile section: glycaemic control, lipids, and endocrine function. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_metabolic_profile.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_metabolic_profile.fasting_glucose_mmol_l IS
    'Fasting plasma glucose in mmol/L.';
COMMENT ON COLUMN assessment_metabolic_profile.hba1c_percent IS
    'Glycated haemoglobin as percentage (DCCT/NGSP).';
COMMENT ON COLUMN assessment_metabolic_profile.hba1c_mmol_mol IS
    'Glycated haemoglobin in mmol/mol (IFCC).';
COMMENT ON COLUMN assessment_metabolic_profile.diabetes_diagnosis IS
    'Whether patient has a diabetes diagnosis.';
COMMENT ON COLUMN assessment_metabolic_profile.diabetes_type IS
    'Type of diabetes: type1 (contraindication), type2, pre (prediabetes), or empty string.';
COMMENT ON COLUMN assessment_metabolic_profile.diabetes_duration_years IS
    'Duration of diabetes in years.';
COMMENT ON COLUMN assessment_metabolic_profile.total_cholesterol_mmol_l IS
    'Total cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_metabolic_profile.ldl_cholesterol_mmol_l IS
    'Low-density lipoprotein cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_metabolic_profile.hdl_cholesterol_mmol_l IS
    'High-density lipoprotein cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_metabolic_profile.triglycerides_mmol_l IS
    'Triglycerides in mmol/L.';
COMMENT ON COLUMN assessment_metabolic_profile.insulin_resistance_suspected IS
    'Whether insulin resistance is suspected.';
COMMENT ON COLUMN assessment_metabolic_profile.metabolic_syndrome IS
    'Whether patient meets criteria for metabolic syndrome.';
COMMENT ON COLUMN assessment_metabolic_profile.thyroid_function_normal IS
    'Whether thyroid function tests are normal (hypothyroidism can cause weight gain).';
COMMENT ON COLUMN assessment_metabolic_profile.tsh_miu_l IS
    'Thyroid-stimulating hormone in mIU/L.';
COMMENT ON COLUMN assessment_metabolic_profile.lab_date IS
    'Date when laboratory tests were performed.';
