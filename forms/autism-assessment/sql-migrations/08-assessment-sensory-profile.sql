-- 08_assessment_sensory_profile.sql
-- Sensory profile section of the autism assessment.

CREATE TABLE assessment_sensory_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hypersensitivity_sound VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hypersensitivity_sound IN ('none', 'mild', 'moderate', 'severe', '')),
    hypersensitivity_light VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hypersensitivity_light IN ('none', 'mild', 'moderate', 'severe', '')),
    hypersensitivity_touch VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hypersensitivity_touch IN ('none', 'mild', 'moderate', 'severe', '')),
    hypersensitivity_taste_smell VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hypersensitivity_taste_smell IN ('none', 'mild', 'moderate', 'severe', '')),
    hyposensitivity_pain VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hyposensitivity_pain IN ('none', 'mild', 'moderate', 'severe', '')),
    hyposensitivity_temperature VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hyposensitivity_temperature IN ('none', 'mild', 'moderate', 'severe', '')),
    sensory_seeking_behaviors VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sensory_seeking_behaviors IN ('yes', 'no', '')),
    sensory_seeking_details TEXT NOT NULL DEFAULT '',
    sensory_avoidance_behaviors VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sensory_avoidance_behaviors IN ('yes', 'no', '')),
    sensory_avoidance_details TEXT NOT NULL DEFAULT '',
    sensory_overload_frequency VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sensory_overload_frequency IN ('never', 'rarely', 'sometimes', 'often', 'daily', '')),
    sensory_profile_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_sensory_profile_updated_at
    BEFORE UPDATE ON assessment_sensory_profile
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_sensory_profile IS
    'Sensory profile section: hypersensitivities, hyposensitivities, sensory seeking and avoidance. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_sensory_profile.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_sensory_profile.hypersensitivity_sound IS
    'Severity of hypersensitivity to sound: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_sensory_profile.hypersensitivity_light IS
    'Severity of hypersensitivity to light.';
COMMENT ON COLUMN assessment_sensory_profile.hypersensitivity_touch IS
    'Severity of hypersensitivity to touch or texture.';
COMMENT ON COLUMN assessment_sensory_profile.hypersensitivity_taste_smell IS
    'Severity of hypersensitivity to taste or smell.';
COMMENT ON COLUMN assessment_sensory_profile.hyposensitivity_pain IS
    'Severity of hyposensitivity (reduced sensitivity) to pain.';
COMMENT ON COLUMN assessment_sensory_profile.hyposensitivity_temperature IS
    'Severity of hyposensitivity to temperature.';
COMMENT ON COLUMN assessment_sensory_profile.sensory_seeking_behaviors IS
    'Whether the patient engages in sensory seeking behaviors: yes, no, or empty.';
COMMENT ON COLUMN assessment_sensory_profile.sensory_seeking_details IS
    'Description of sensory seeking behaviors.';
COMMENT ON COLUMN assessment_sensory_profile.sensory_avoidance_behaviors IS
    'Whether the patient engages in sensory avoidance behaviors: yes, no, or empty.';
COMMENT ON COLUMN assessment_sensory_profile.sensory_avoidance_details IS
    'Description of sensory avoidance behaviors.';
COMMENT ON COLUMN assessment_sensory_profile.sensory_overload_frequency IS
    'Frequency of sensory overload episodes: never, rarely, sometimes, often, daily, or empty.';
COMMENT ON COLUMN assessment_sensory_profile.sensory_profile_notes IS
    'Additional clinician or patient notes on sensory profile.';
