-- 11_assessment_allergies_and_diet.sql
-- Step 9: Allergies and diet section of the gastroenterology assessment.

CREATE TABLE assessment_allergies_and_diet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_drug_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_drug_allergies IN ('yes', 'no', '')),
    drug_allergy_details TEXT NOT NULL DEFAULT '',
    has_food_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_allergies IN ('yes', 'no', '')),
    food_allergy_details TEXT NOT NULL DEFAULT '',
    has_food_intolerances VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_food_intolerances IN ('yes', 'no', '')),
    food_intolerance_details TEXT NOT NULL DEFAULT '',
    lactose_intolerance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lactose_intolerance IN ('yes', 'no', '')),
    gluten_sensitivity VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gluten_sensitivity IN ('yes', 'no', '')),
    fructose_intolerance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fructose_intolerance IN ('yes', 'no', '')),
    dietary_restrictions TEXT NOT NULL DEFAULT '',
    diet_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (diet_type IN ('omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_fodmap', 'gluten_free', 'other', '')),
    diet_type_other TEXT NOT NULL DEFAULT '',
    fibre_intake VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (fibre_intake IN ('low', 'adequate', 'high', '')),
    fluid_intake_litres NUMERIC(3,1)
        CHECK (fluid_intake_litres IS NULL OR fluid_intake_litres >= 0),
    caffeine_intake VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (caffeine_intake IN ('none', 'low', 'moderate', 'high', '')),
    nutritional_supplements TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_allergies_and_diet_updated_at
    BEFORE UPDATE ON assessment_allergies_and_diet
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_allergies_and_diet IS
    'Step 9 Allergies & Diet: food allergies, intolerances, and dietary habits. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_allergies_and_diet.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_allergies_and_diet.has_drug_allergies IS
    'Whether the patient has known drug allergies.';
COMMENT ON COLUMN assessment_allergies_and_diet.drug_allergy_details IS
    'Details of drug allergies.';
COMMENT ON COLUMN assessment_allergies_and_diet.has_food_allergies IS
    'Whether the patient has food allergies (IgE-mediated).';
COMMENT ON COLUMN assessment_allergies_and_diet.food_allergy_details IS
    'Details of food allergies including allergens and reaction type.';
COMMENT ON COLUMN assessment_allergies_and_diet.has_food_intolerances IS
    'Whether the patient has food intolerances (non-IgE-mediated).';
COMMENT ON COLUMN assessment_allergies_and_diet.food_intolerance_details IS
    'Details of food intolerances.';
COMMENT ON COLUMN assessment_allergies_and_diet.lactose_intolerance IS
    'Whether the patient has lactose intolerance.';
COMMENT ON COLUMN assessment_allergies_and_diet.gluten_sensitivity IS
    'Whether the patient has non-coeliac gluten sensitivity.';
COMMENT ON COLUMN assessment_allergies_and_diet.fructose_intolerance IS
    'Whether the patient has fructose intolerance.';
COMMENT ON COLUMN assessment_allergies_and_diet.dietary_restrictions IS
    'Description of any dietary restrictions.';
COMMENT ON COLUMN assessment_allergies_and_diet.diet_type IS
    'Patient dietary pattern.';
COMMENT ON COLUMN assessment_allergies_and_diet.diet_type_other IS
    'Description if diet type is other.';
COMMENT ON COLUMN assessment_allergies_and_diet.fibre_intake IS
    'Self-reported fibre intake level.';
COMMENT ON COLUMN assessment_allergies_and_diet.fluid_intake_litres IS
    'Daily fluid intake in litres.';
COMMENT ON COLUMN assessment_allergies_and_diet.caffeine_intake IS
    'Caffeine consumption level (can affect GI symptoms).';
COMMENT ON COLUMN assessment_allergies_and_diet.nutritional_supplements IS
    'Nutritional supplements taken.';
COMMENT ON COLUMN assessment_allergies_and_diet.additional_notes IS
    'Additional notes about allergies and diet.';
