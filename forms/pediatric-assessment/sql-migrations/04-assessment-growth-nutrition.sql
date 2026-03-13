-- 04_assessment_growth_nutrition.sql
-- Growth and nutrition section of the pediatric assessment.

CREATE TABLE assessment_growth_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    current_weight_kg NUMERIC(5,2)
        CHECK (current_weight_kg IS NULL OR current_weight_kg > 0),
    current_height_cm NUMERIC(5,1)
        CHECK (current_height_cm IS NULL OR current_height_cm > 0),
    head_circumference_cm NUMERIC(4,1)
        CHECK (head_circumference_cm IS NULL OR head_circumference_cm > 0),
    weight_percentile INTEGER
        CHECK (weight_percentile IS NULL OR (weight_percentile >= 0 AND weight_percentile <= 100)),
    height_percentile INTEGER
        CHECK (height_percentile IS NULL OR (height_percentile >= 0 AND height_percentile <= 100)),
    bmi_percentile INTEGER
        CHECK (bmi_percentile IS NULL OR (bmi_percentile >= 0 AND bmi_percentile <= 100)),
    feeding_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (feeding_method IN ('breastfed', 'formula-fed', 'mixed', 'solid-foods', '')),
    dietary_concerns TEXT NOT NULL DEFAULT '',
    appetite VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite IN ('good', 'fair', 'poor', '')),
    nutritional_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nutritional_supplements IN ('yes', 'no', '')),
    supplement_details TEXT NOT NULL DEFAULT '',
    growth_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (growth_concerns IN ('yes', 'no', '')),
    growth_concern_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_growth_nutrition_updated_at
    BEFORE UPDATE ON assessment_growth_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_growth_nutrition IS
    'Growth and nutrition section: anthropometric measurements, percentiles, feeding method, and dietary concerns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_growth_nutrition.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_growth_nutrition.current_weight_kg IS
    'Current weight in kilograms.';
COMMENT ON COLUMN assessment_growth_nutrition.current_height_cm IS
    'Current height/length in centimetres.';
COMMENT ON COLUMN assessment_growth_nutrition.head_circumference_cm IS
    'Head circumference in centimetres (important for infants and toddlers).';
COMMENT ON COLUMN assessment_growth_nutrition.weight_percentile IS
    'Weight-for-age percentile on WHO/CDC growth chart.';
COMMENT ON COLUMN assessment_growth_nutrition.height_percentile IS
    'Height/length-for-age percentile on WHO/CDC growth chart.';
COMMENT ON COLUMN assessment_growth_nutrition.bmi_percentile IS
    'BMI-for-age percentile on WHO/CDC growth chart.';
COMMENT ON COLUMN assessment_growth_nutrition.feeding_method IS
    'Primary feeding method: breastfed, formula-fed, mixed, solid-foods, or empty.';
COMMENT ON COLUMN assessment_growth_nutrition.appetite IS
    'General appetite assessment: good, fair, poor, or empty.';
COMMENT ON COLUMN assessment_growth_nutrition.nutritional_supplements IS
    'Whether the child takes nutritional supplements.';
COMMENT ON COLUMN assessment_growth_nutrition.growth_concerns IS
    'Whether there are any concerns about growth trajectory.';
