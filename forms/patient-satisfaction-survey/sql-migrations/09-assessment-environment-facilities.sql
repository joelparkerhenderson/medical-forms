-- 09_assessment_environment_facilities.sql
-- Environment and facilities section of the patient satisfaction survey.

CREATE TABLE assessment_environment_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cleanliness INTEGER
        CHECK (cleanliness IS NULL OR (cleanliness >= 1 AND cleanliness <= 5)),
    comfort INTEGER
        CHECK (comfort IS NULL OR (comfort >= 1 AND comfort <= 5)),
    noise_levels INTEGER
        CHECK (noise_levels IS NULL OR (noise_levels >= 1 AND noise_levels <= 5)),
    food_quality INTEGER
        CHECK (food_quality IS NULL OR (food_quality >= 1 AND food_quality <= 5)),
    toilet_facilities INTEGER
        CHECK (toilet_facilities IS NULL OR (toilet_facilities >= 1 AND toilet_facilities <= 5)),
    temperature_comfort INTEGER
        CHECK (temperature_comfort IS NULL OR (temperature_comfort >= 1 AND temperature_comfort <= 5)),
    environment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_environment_facilities_updated_at
    BEFORE UPDATE ON assessment_environment_facilities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_environment_facilities IS
    'Environment and facilities section: cleanliness, comfort, noise, food, and toilet facilities. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_environment_facilities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_environment_facilities.cleanliness IS
    'Satisfaction with cleanliness of the environment (1-5 Likert).';
COMMENT ON COLUMN assessment_environment_facilities.comfort IS
    'Satisfaction with comfort of waiting and treatment areas (1-5 Likert).';
COMMENT ON COLUMN assessment_environment_facilities.noise_levels IS
    'Satisfaction with noise levels (1-5 Likert).';
COMMENT ON COLUMN assessment_environment_facilities.food_quality IS
    'Satisfaction with food quality if applicable (1-5 Likert).';
COMMENT ON COLUMN assessment_environment_facilities.toilet_facilities IS
    'Satisfaction with toilet and bathroom facilities (1-5 Likert).';
COMMENT ON COLUMN assessment_environment_facilities.temperature_comfort IS
    'Satisfaction with temperature and ventilation (1-5 Likert).';
COMMENT ON COLUMN assessment_environment_facilities.environment_notes IS
    'Additional notes about environment and facilities.';
