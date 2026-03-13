-- 12_assessment_social_functional.sql
-- Social and functional section of the cardiology assessment.

CREATE TABLE assessment_social_functional (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    exercise_capacity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_capacity IN ('unlimited', 'moderate-limitation', 'severe-limitation', 'bed-bound', '')),
    flights_of_stairs INTEGER
        CHECK (flights_of_stairs IS NULL OR (flights_of_stairs >= 0 AND flights_of_stairs <= 50)),
    walking_distance_metres INTEGER
        CHECK (walking_distance_metres IS NULL OR walking_distance_metres >= 0),
    driving_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_status IN ('driving', 'not-driving', 'dvla-notified', 'licence-revoked', '')),
    employment_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (employment_status IN ('employed', 'unemployed', 'retired', 'sick-leave', 'other', '')),
    occupation VARCHAR(255) NOT NULL DEFAULT '',
    physical_demands_of_work VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (physical_demands_of_work IN ('sedentary', 'light', 'moderate', 'heavy', '')),
    alcohol_consumption VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_consumption IN ('none', 'within-guidelines', 'above-guidelines', '')),
    alcohol_units_per_week INTEGER
        CHECK (alcohol_units_per_week IS NULL OR alcohol_units_per_week >= 0),
    recreational_drug_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recreational_drug_use IN ('yes', 'no', '')),
    recreational_drug_details TEXT NOT NULL DEFAULT '',
    psychological_impact VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (psychological_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    anxiety_depression_screen VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_depression_screen IN ('yes', 'no', '')),
    social_functional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_functional_updated_at
    BEFORE UPDATE ON assessment_social_functional
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_functional IS
    'Social and functional section: exercise capacity, driving, employment, alcohol, psychological impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_functional.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_functional.exercise_capacity IS
    'Self-reported exercise capacity: unlimited, moderate-limitation, severe-limitation, bed-bound, or empty.';
COMMENT ON COLUMN assessment_social_functional.flights_of_stairs IS
    'Number of flights of stairs the patient can climb without stopping.';
COMMENT ON COLUMN assessment_social_functional.walking_distance_metres IS
    'Maximum walking distance on flat ground in metres before symptoms.';
COMMENT ON COLUMN assessment_social_functional.driving_status IS
    'Driving status: driving, not-driving, dvla-notified, licence-revoked, or empty.';
COMMENT ON COLUMN assessment_social_functional.employment_status IS
    'Employment status: employed, unemployed, retired, sick-leave, other, or empty.';
COMMENT ON COLUMN assessment_social_functional.occupation IS
    'Patient occupation or former occupation.';
COMMENT ON COLUMN assessment_social_functional.physical_demands_of_work IS
    'Physical demands of work: sedentary, light, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_social_functional.alcohol_consumption IS
    'Alcohol consumption level: none, within-guidelines, above-guidelines, or empty.';
COMMENT ON COLUMN assessment_social_functional.alcohol_units_per_week IS
    'Approximate alcohol units consumed per week.';
COMMENT ON COLUMN assessment_social_functional.recreational_drug_use IS
    'Whether the patient uses recreational drugs: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_functional.recreational_drug_details IS
    'Details of recreational drug use.';
COMMENT ON COLUMN assessment_social_functional.psychological_impact IS
    'Psychological impact of cardiac condition: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_social_functional.anxiety_depression_screen IS
    'Whether formal anxiety/depression screening is indicated: yes, no, or empty.';
COMMENT ON COLUMN assessment_social_functional.social_functional_notes IS
    'Additional clinician notes on social and functional assessment.';
