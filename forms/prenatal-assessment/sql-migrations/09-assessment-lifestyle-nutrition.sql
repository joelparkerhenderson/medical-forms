-- 09_assessment_lifestyle_nutrition.sql
-- Lifestyle and nutrition section of the prenatal assessment.

CREATE TABLE assessment_lifestyle_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'former', 'current', '')),
    cigarettes_per_day INTEGER
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    smoking_cessation_advice VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (smoking_cessation_advice IN ('yes', 'no', '')),
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'stopped', 'occasional', 'regular', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    drug_use_details TEXT NOT NULL DEFAULT '',
    folic_acid_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (folic_acid_supplementation IN ('yes', 'no', '')),
    folic_acid_dose VARCHAR(20) NOT NULL DEFAULT '',
    vitamin_d_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vitamin_d_supplementation IN ('yes', 'no', '')),
    iron_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (iron_supplementation IN ('yes', 'no', '')),
    dietary_restrictions TEXT NOT NULL DEFAULT '',
    exercise_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('daily', 'several-per-week', 'weekly', 'rarely', 'none', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    occupational_hazards VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_hazards IN ('yes', 'no', '')),
    occupational_hazard_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lifestyle_nutrition_updated_at
    BEFORE UPDATE ON assessment_lifestyle_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lifestyle_nutrition IS
    'Lifestyle and nutrition section: smoking, alcohol, substance use, supplementation, diet, exercise, and occupational risks. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lifestyle_nutrition.smoking_status IS
    'Smoking status: never, former, current, or empty.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.cigarettes_per_day IS
    'Number of cigarettes smoked per day, if current smoker.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.alcohol_use IS
    'Alcohol consumption pattern: none, stopped, occasional, regular, or empty.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.alcohol_units_per_week IS
    'Estimated alcohol units consumed per week.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.recreational_drug_use IS
    'Whether the patient uses recreational drugs.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.folic_acid_supplementation IS
    'Whether the patient is taking folic acid supplements.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.vitamin_d_supplementation IS
    'Whether the patient is taking vitamin D supplements.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.iron_supplementation IS
    'Whether the patient is taking iron supplements.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.exercise_frequency IS
    'Exercise frequency: daily, several-per-week, weekly, rarely, none, or empty.';
COMMENT ON COLUMN assessment_lifestyle_nutrition.occupational_hazards IS
    'Whether the patient is exposed to occupational hazards during pregnancy.';
