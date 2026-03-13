-- 08_assessment_lifestyle_factors.sql
-- Lifestyle factors section of the assessment.

CREATE TABLE assessment_lifestyle_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'former', 'current', '')),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR (cigarettes_per_day >= 0 AND cigarettes_per_day <= 100)),
    years_since_quit INTEGER
        CHECK (years_since_quit IS NULL OR (years_since_quit >= 0 AND years_since_quit <= 80)),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR (alcohol_units_per_week >= 0 AND alcohol_units_per_week <= 200)),
    physical_activity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (physical_activity IN ('sedentary', 'light', 'moderate', 'active', '')),
    diet_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diet_quality IN ('poor', 'fair', 'good', 'excellent', '')),
    bmi NUMERIC(4,1)
        CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 80)),
    waist_circumference_cm NUMERIC(5,1)
        CHECK (waist_circumference_cm IS NULL OR (waist_circumference_cm >= 30 AND waist_circumference_cm <= 250)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lifestyle_factors_updated_at
    BEFORE UPDATE ON assessment_lifestyle_factors
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lifestyle_factors IS
    'Lifestyle factors section: smoking, alcohol, physical activity, diet, and body composition. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lifestyle_factors.smoking_status IS
    'Smoking status: never, former, current, or empty string if unanswered.';
COMMENT ON COLUMN assessment_lifestyle_factors.physical_activity IS
    'Physical activity level: sedentary, light, moderate, active, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_factors.bmi IS
    'Body mass index in kg/m².';
COMMENT ON COLUMN assessment_lifestyle_factors.waist_circumference_cm IS
    'Waist circumference in centimetres.';
