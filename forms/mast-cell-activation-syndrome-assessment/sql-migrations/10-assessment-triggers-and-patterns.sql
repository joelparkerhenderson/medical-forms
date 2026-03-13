-- 10_assessment_triggers_and_patterns.sql
-- Triggers and patterns section of the MCAS assessment.

CREATE TABLE assessment_triggers_and_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    heat_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (heat_trigger IN ('yes', 'no', '')),
    cold_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cold_trigger IN ('yes', 'no', '')),
    stress_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stress_trigger IN ('yes', 'no', '')),
    exercise_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercise_trigger IN ('yes', 'no', '')),
    food_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (food_trigger IN ('yes', 'no', '')),
    food_trigger_details TEXT NOT NULL DEFAULT '',
    alcohol_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alcohol_trigger IN ('yes', 'no', '')),
    medication_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (medication_trigger IN ('yes', 'no', '')),
    medication_trigger_details TEXT NOT NULL DEFAULT '',
    fragrance_chemical_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fragrance_chemical_trigger IN ('yes', 'no', '')),
    insect_sting_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (insect_sting_trigger IN ('yes', 'no', '')),
    hormonal_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hormonal_trigger IN ('yes', 'no', '')),
    hormonal_trigger_details TEXT NOT NULL DEFAULT '',
    infection_trigger VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (infection_trigger IN ('yes', 'no', '')),
    other_triggers TEXT NOT NULL DEFAULT '',
    diurnal_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diurnal_pattern IN ('morning', 'afternoon', 'evening', 'night', 'none', '')),
    seasonal_pattern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seasonal_pattern IN ('yes', 'no', '')),
    seasonal_pattern_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_triggers_and_patterns_updated_at
    BEFORE UPDATE ON assessment_triggers_and_patterns
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_triggers_and_patterns IS
    'Triggers and patterns section: identifies known triggers and temporal patterns of MCAS symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_triggers_and_patterns.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_triggers_and_patterns.heat_trigger IS
    'Whether heat triggers symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.cold_trigger IS
    'Whether cold triggers symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.stress_trigger IS
    'Whether emotional or physical stress triggers symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.exercise_trigger IS
    'Whether exercise triggers symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.food_trigger IS
    'Whether certain foods trigger symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.food_trigger_details IS
    'Free-text details of specific food triggers.';
COMMENT ON COLUMN assessment_triggers_and_patterns.alcohol_trigger IS
    'Whether alcohol triggers symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.medication_trigger IS
    'Whether medications trigger symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.medication_trigger_details IS
    'Free-text details of specific medication triggers.';
COMMENT ON COLUMN assessment_triggers_and_patterns.fragrance_chemical_trigger IS
    'Whether fragrances or chemicals trigger symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.insect_sting_trigger IS
    'Whether insect stings trigger symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.hormonal_trigger IS
    'Whether hormonal changes trigger symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.hormonal_trigger_details IS
    'Free-text details of hormonal trigger patterns (e.g. menstrual cycle).';
COMMENT ON COLUMN assessment_triggers_and_patterns.infection_trigger IS
    'Whether infections trigger symptoms: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.other_triggers IS
    'Free-text description of any other identified triggers.';
COMMENT ON COLUMN assessment_triggers_and_patterns.diurnal_pattern IS
    'Time of day when symptoms are worst: morning, afternoon, evening, night, none, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.seasonal_pattern IS
    'Whether symptoms follow a seasonal pattern: yes, no, or empty string.';
COMMENT ON COLUMN assessment_triggers_and_patterns.seasonal_pattern_details IS
    'Free-text details of seasonal variation in symptoms.';
