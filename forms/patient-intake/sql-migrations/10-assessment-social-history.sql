-- 10_assessment_social_history.sql
-- Social history section of the patient intake assessment.

CREATE TABLE assessment_social_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    smoking_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (smoking_status IN ('never', 'former', 'current', '')),
    smoking_pack_years NUMERIC(5,1)
        CHECK (smoking_pack_years IS NULL OR smoking_pack_years >= 0),
    smoking_quit_date DATE,
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'social', 'moderate', 'heavy', '')),
    alcohol_units_per_week NUMERIC(5,1)
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    recreational_drug_details TEXT NOT NULL DEFAULT '',
    caffeine_intake VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (caffeine_intake IN ('none', 'low', 'moderate', 'high', '')),
    exercise_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (exercise_frequency IN ('daily', 'several-times-weekly', 'weekly', 'occasionally', 'rarely', 'never', '')),
    exercise_type TEXT NOT NULL DEFAULT '',
    diet_description VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (diet_description IN ('balanced', 'vegetarian', 'vegan', 'restricted', 'poor', '')),
    diet_details TEXT NOT NULL DEFAULT '',
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'retired', 'student', 'disability', '')),
    occupational_hazards TEXT NOT NULL DEFAULT '',
    living_situation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (living_situation IN ('alone', 'with-partner', 'with-family', 'shared-housing', 'care-home', '')),
    housing_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (housing_type IN ('house', 'flat', 'bungalow', 'sheltered', 'homeless', 'other', '')),
    sexual_health_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sexual_health_concerns IN ('yes', 'no', '')),
    travel_history TEXT NOT NULL DEFAULT '',
    social_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_history_updated_at
    BEFORE UPDATE ON assessment_social_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_history IS
    'Social history section: smoking, alcohol, drugs, exercise, diet, occupation, and living situation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_history.smoking_status IS
    'Smoking status: never, former, current, or empty.';
COMMENT ON COLUMN assessment_social_history.smoking_pack_years IS
    'Smoking pack-years (packs per day multiplied by years).';
COMMENT ON COLUMN assessment_social_history.smoking_quit_date IS
    'Date smoking was stopped if former smoker.';
COMMENT ON COLUMN assessment_social_history.alcohol_use IS
    'Alcohol consumption level: none, social, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_social_history.alcohol_units_per_week IS
    'Estimated alcohol units consumed per week.';
COMMENT ON COLUMN assessment_social_history.recreational_drug_use IS
    'Whether the patient uses recreational drugs: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_history.recreational_drug_details IS
    'Details of recreational drug use.';
COMMENT ON COLUMN assessment_social_history.caffeine_intake IS
    'Caffeine intake level: none, low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_social_history.exercise_frequency IS
    'Exercise frequency: daily, several-times-weekly, weekly, occasionally, rarely, never, or empty.';
COMMENT ON COLUMN assessment_social_history.exercise_type IS
    'Types of exercise or physical activity undertaken.';
COMMENT ON COLUMN assessment_social_history.diet_description IS
    'General diet description: balanced, vegetarian, vegan, restricted, poor, or empty.';
COMMENT ON COLUMN assessment_social_history.diet_details IS
    'Additional details about diet and nutrition.';
COMMENT ON COLUMN assessment_social_history.occupation IS
    'Current or most recent occupation.';
COMMENT ON COLUMN assessment_social_history.employment_status IS
    'Employment status: employed, self-employed, unemployed, retired, student, disability, or empty.';
COMMENT ON COLUMN assessment_social_history.occupational_hazards IS
    'Known occupational hazards or exposures.';
COMMENT ON COLUMN assessment_social_history.living_situation IS
    'Living arrangement: alone, with-partner, with-family, shared-housing, care-home, or empty.';
COMMENT ON COLUMN assessment_social_history.housing_type IS
    'Type of housing: house, flat, bungalow, sheltered, homeless, other, or empty.';
COMMENT ON COLUMN assessment_social_history.sexual_health_concerns IS
    'Whether the patient has sexual health concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_history.travel_history IS
    'Recent travel history relevant to health.';
COMMENT ON COLUMN assessment_social_history.social_history_notes IS
    'Additional notes on social history.';
