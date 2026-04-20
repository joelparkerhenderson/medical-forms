-- 05_assessment_dietary_history.sql
-- Dietary history section of the nutrition assessment.

CREATE TABLE assessment_dietary_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    meals_per_day INTEGER
        CHECK (meals_per_day IS NULL OR (meals_per_day >= 0 AND meals_per_day <= 10)),
    snacks_per_day INTEGER
        CHECK (snacks_per_day IS NULL OR (snacks_per_day >= 0 AND snacks_per_day <= 10)),
    appetite VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite IN ('good', 'fair', 'poor', 'absent', '')),
    appetite_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite_change IN ('increased', 'stable', 'decreased', 'significantly-decreased', '')),
    fluid_intake_ml_per_day INTEGER
        CHECK (fluid_intake_ml_per_day IS NULL OR fluid_intake_ml_per_day >= 0),
    diet_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (diet_type IN ('normal', 'vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'other', '')),
    diet_type_other TEXT NOT NULL DEFAULT '',
    texture_modification VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (texture_modification IN ('normal', 'soft', 'minced-moist', 'pureed', 'liquidised', '')),
    fluid_consistency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fluid_consistency IN ('thin', 'slightly-thick', 'mildly-thick', 'moderately-thick', 'extremely-thick', '')),
    meal_preparation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (meal_preparation IN ('self', 'family', 'carer', 'meals-on-wheels', 'residential', 'other', '')),
    dietary_restrictions TEXT NOT NULL DEFAULT '',
    dietary_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dietary_history_updated_at
    BEFORE UPDATE ON assessment_dietary_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dietary_history IS
    'Dietary history section: meal patterns, appetite, fluid intake, diet type, and texture modifications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dietary_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dietary_history.meals_per_day IS
    'Number of meals eaten per day.';
COMMENT ON COLUMN assessment_dietary_history.snacks_per_day IS
    'Number of snacks eaten per day.';
COMMENT ON COLUMN assessment_dietary_history.appetite IS
    'Current appetite level: good, fair, poor, absent, or empty.';
COMMENT ON COLUMN assessment_dietary_history.appetite_change IS
    'Recent change in appetite: increased, stable, decreased, significantly-decreased, or empty.';
COMMENT ON COLUMN assessment_dietary_history.fluid_intake_ml_per_day IS
    'Estimated daily fluid intake in millilitres.';
COMMENT ON COLUMN assessment_dietary_history.diet_type IS
    'Type of diet: normal, vegetarian, vegan, halal, kosher, gluten-free, other, or empty.';
COMMENT ON COLUMN assessment_dietary_history.diet_type_other IS
    'Description of diet type if other is selected.';
COMMENT ON COLUMN assessment_dietary_history.texture_modification IS
    'IDDSI texture level: normal, soft, minced-moist, pureed, liquidised, or empty.';
COMMENT ON COLUMN assessment_dietary_history.fluid_consistency IS
    'IDDSI fluid consistency: thin, slightly-thick, mildly-thick, moderately-thick, extremely-thick, or empty.';
COMMENT ON COLUMN assessment_dietary_history.meal_preparation IS
    'Who prepares meals: self, family, carer, meals-on-wheels, residential, other, or empty.';
COMMENT ON COLUMN assessment_dietary_history.dietary_restrictions IS
    'Any specific dietary restrictions or preferences.';
COMMENT ON COLUMN assessment_dietary_history.dietary_history_notes IS
    'Additional clinician notes on dietary history.';
