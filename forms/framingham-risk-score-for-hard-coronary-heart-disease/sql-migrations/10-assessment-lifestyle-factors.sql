-- 10_assessment_lifestyle_factors.sql
-- Step 8: Lifestyle factors section of the Framingham Risk Score assessment.

CREATE TABLE assessment_lifestyle_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    physical_activity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (physical_activity IN ('sedentary', 'light', 'moderate', 'vigorous', '')),
    alcohol_consumption VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_consumption IN ('none', 'light', 'moderate', 'heavy', '')),
    diet_quality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diet_quality IN ('poor', 'fair', 'good', 'excellent', '')),
    bmi NUMERIC(4,1)
        CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80)),
    waist_circumference_cm NUMERIC(5,1)
        CHECK (waist_circumference_cm IS NULL OR waist_circumference_cm >= 0),
    stress_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (stress_level IN ('low', 'moderate', 'high', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lifestyle_factors_updated_at
    BEFORE UPDATE ON assessment_lifestyle_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lifestyle_factors IS
    'Step 8 Lifestyle Factors: physical activity, diet, BMI, and other modifiable risk factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lifestyle_factors.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lifestyle_factors.physical_activity IS
    'Physical activity level: sedentary (risk factor), light, moderate, or vigorous (protective).';
COMMENT ON COLUMN assessment_lifestyle_factors.alcohol_consumption IS
    'Alcohol consumption level.';
COMMENT ON COLUMN assessment_lifestyle_factors.diet_quality IS
    'Self-reported diet quality.';
COMMENT ON COLUMN assessment_lifestyle_factors.bmi IS
    'Body mass index (BMI >= 30 is an obesity risk factor).';
COMMENT ON COLUMN assessment_lifestyle_factors.waist_circumference_cm IS
    'Waist circumference in centimetres (central obesity marker).';
COMMENT ON COLUMN assessment_lifestyle_factors.stress_level IS
    'Self-reported stress level.';
