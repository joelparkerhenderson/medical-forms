-- 06_assessment_care_preferences.sql
-- Care preferences section of the advance statement about care.

CREATE TABLE assessment_care_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_place_of_care TEXT NOT NULL DEFAULT '',
    preferred_place_of_death TEXT NOT NULL DEFAULT '',
    daily_routine_preferences TEXT NOT NULL DEFAULT '',
    personal_care_preferences TEXT NOT NULL DEFAULT '',
    food_and_drink_preferences TEXT NOT NULL DEFAULT '',
    sleep_preferences TEXT NOT NULL DEFAULT '',
    clothing_preferences TEXT NOT NULL DEFAULT '',
    environment_preferences TEXT NOT NULL DEFAULT '',
    pet_care_wishes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_care_preferences_updated_at
    BEFORE UPDATE ON assessment_care_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_care_preferences IS
    'Care preferences section: preferred care settings, daily routines, and personal care wishes. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_care_preferences.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_care_preferences.preferred_place_of_care IS
    'Where the person would prefer to receive care (e.g. home, care home, hospice).';
COMMENT ON COLUMN assessment_care_preferences.preferred_place_of_death IS
    'Where the person would prefer to die.';
COMMENT ON COLUMN assessment_care_preferences.daily_routine_preferences IS
    'Preferences for daily routines (e.g. wake time, meal times, activities).';
COMMENT ON COLUMN assessment_care_preferences.personal_care_preferences IS
    'Preferences for personal care (e.g. bathing, grooming, gender of carer).';
COMMENT ON COLUMN assessment_care_preferences.food_and_drink_preferences IS
    'Dietary preferences and restrictions.';
COMMENT ON COLUMN assessment_care_preferences.sleep_preferences IS
    'Sleep-related preferences (e.g. bedtime, light, noise).';
COMMENT ON COLUMN assessment_care_preferences.clothing_preferences IS
    'Preferences about clothing and personal appearance.';
COMMENT ON COLUMN assessment_care_preferences.environment_preferences IS
    'Preferences about the care environment (e.g. music, TV, visitors).';
COMMENT ON COLUMN assessment_care_preferences.pet_care_wishes IS
    'Wishes regarding care of pets if the person can no longer look after them.';
