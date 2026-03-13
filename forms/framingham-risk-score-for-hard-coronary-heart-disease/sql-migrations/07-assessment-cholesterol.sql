-- 07_assessment_cholesterol.sql
-- Step 5: Cholesterol section of the Framingham Risk Score assessment.

CREATE TABLE assessment_cholesterol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    total_cholesterol NUMERIC(6,2)
        CHECK (total_cholesterol IS NULL OR total_cholesterol >= 0),
    hdl_cholesterol NUMERIC(6,2)
        CHECK (hdl_cholesterol IS NULL OR hdl_cholesterol >= 0),
    ldl_cholesterol NUMERIC(6,2)
        CHECK (ldl_cholesterol IS NULL OR ldl_cholesterol >= 0),
    triglycerides NUMERIC(6,2)
        CHECK (triglycerides IS NULL OR triglycerides >= 0),
    cholesterol_unit VARCHAR(10) NOT NULL DEFAULT 'mgDl'
        CHECK (cholesterol_unit IN ('mgDl', 'mmolL', '')),
    fasting_sample VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fasting_sample IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cholesterol_updated_at
    BEFORE UPDATE ON assessment_cholesterol
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cholesterol IS
    'Step 5 Cholesterol: lipid panel values for Framingham risk calculation. Total cholesterol and HDL are primary inputs. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cholesterol.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cholesterol.total_cholesterol IS
    'Total cholesterol level (key Framingham variable).';
COMMENT ON COLUMN assessment_cholesterol.hdl_cholesterol IS
    'HDL cholesterol level (key Framingham variable, protective factor).';
COMMENT ON COLUMN assessment_cholesterol.ldl_cholesterol IS
    'LDL cholesterol level.';
COMMENT ON COLUMN assessment_cholesterol.triglycerides IS
    'Triglyceride level.';
COMMENT ON COLUMN assessment_cholesterol.cholesterol_unit IS
    'Unit of measurement: mgDl (mg/dL) or mmolL (mmol/L).';
COMMENT ON COLUMN assessment_cholesterol.fasting_sample IS
    'Whether the blood sample was fasting (affects triglyceride interpretation).';
