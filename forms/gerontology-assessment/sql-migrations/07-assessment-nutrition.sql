-- 07_assessment_nutrition.sql
-- Nutrition section of the gerontology assessment.

CREATE TABLE assessment_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    unintentional_weight_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (unintentional_weight_loss IN ('yes', 'no', '')),
    weight_loss_amount_kg NUMERIC(5,1),
    weight_loss_duration_months INTEGER
        CHECK (weight_loss_duration_months IS NULL OR weight_loss_duration_months >= 0),
    appetite VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (appetite IN ('good', 'reduced', 'poor', '')),
    meals_per_day INTEGER
        CHECK (meals_per_day IS NULL OR (meals_per_day >= 0 AND meals_per_day <= 10)),
    meal_preparation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (meal_preparation IN ('self', 'family', 'meals-on-wheels', 'care-home', '')),
    dietary_restrictions TEXT NOT NULL DEFAULT '',
    swallowing_difficulty VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (swallowing_difficulty IN ('yes', 'no', '')),
    swallowing_details TEXT NOT NULL DEFAULT '',
    denture_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (denture_status IN ('none', 'partial', 'full', 'ill-fitting', '')),
    hydration_status VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (hydration_status IN ('adequate', 'poor', '')),
    must_score INTEGER
        CHECK (must_score IS NULL OR (must_score >= 0 AND must_score <= 6)),
    nutritional_supplement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nutritional_supplement IN ('yes', 'no', '')),
    supplement_details TEXT NOT NULL DEFAULT '',
    nutrition_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_nutrition_updated_at
    BEFORE UPDATE ON assessment_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_nutrition IS
    'Nutrition section: weight loss, appetite, meals, swallowing, hydration, and MUST screening. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_nutrition.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_nutrition.unintentional_weight_loss IS
    'Whether there has been unintentional weight loss: yes, no, or empty string.';
COMMENT ON COLUMN assessment_nutrition.weight_loss_amount_kg IS
    'Amount of unintentional weight loss in kilograms, NULL if unanswered.';
COMMENT ON COLUMN assessment_nutrition.weight_loss_duration_months IS
    'Duration of weight loss in months, NULL if unanswered.';
COMMENT ON COLUMN assessment_nutrition.appetite IS
    'Current appetite: good, reduced, poor, or empty string.';
COMMENT ON COLUMN assessment_nutrition.meals_per_day IS
    'Number of meals per day, NULL if unanswered.';
COMMENT ON COLUMN assessment_nutrition.meal_preparation IS
    'Who prepares meals: self, family, meals-on-wheels, care-home, or empty string.';
COMMENT ON COLUMN assessment_nutrition.dietary_restrictions IS
    'Free-text description of dietary restrictions or special diets.';
COMMENT ON COLUMN assessment_nutrition.swallowing_difficulty IS
    'Whether there is difficulty swallowing (dysphagia): yes, no, or empty string.';
COMMENT ON COLUMN assessment_nutrition.swallowing_details IS
    'Details of swallowing difficulties.';
COMMENT ON COLUMN assessment_nutrition.denture_status IS
    'Denture status: none, partial, full, ill-fitting, or empty string.';
COMMENT ON COLUMN assessment_nutrition.hydration_status IS
    'Hydration status: adequate, poor, or empty string.';
COMMENT ON COLUMN assessment_nutrition.must_score IS
    'Malnutrition Universal Screening Tool (MUST) score (0-6), NULL if not assessed.';
COMMENT ON COLUMN assessment_nutrition.nutritional_supplement IS
    'Whether nutritional supplements are being taken: yes, no, or empty string.';
COMMENT ON COLUMN assessment_nutrition.supplement_details IS
    'Details of nutritional supplements.';
COMMENT ON COLUMN assessment_nutrition.nutrition_notes IS
    'Free-text notes on nutritional assessment.';
