-- 10_assessment_environmental.sql
-- Environmental assessment section of the sundowner syndrome assessment.

CREATE TABLE assessment_environmental (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    lighting_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (lighting_adequate IN ('yes', 'no', '')),
    lighting_notes TEXT NOT NULL DEFAULT '',
    noise_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (noise_level IN ('quiet', 'moderate', 'noisy', '')),
    temperature_comfortable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (temperature_comfortable IN ('yes', 'no', '')),
    familiar_objects_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (familiar_objects_present IN ('yes', 'no', '')),
    orientation_cues_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_cues_present IN ('yes', 'no', '')),
    orientation_cues_details TEXT NOT NULL DEFAULT '',
    safe_wandering_space VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safe_wandering_space IN ('yes', 'no', '')),
    exit_security VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exit_security IN ('yes', 'no', '')),
    fall_hazards_addressed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fall_hazards_addressed IN ('yes', 'no', '')),
    structured_routine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (structured_routine IN ('yes', 'no', '')),
    evening_routine_established VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (evening_routine_established IN ('yes', 'no', '')),
    evening_routine_details TEXT NOT NULL DEFAULT '',
    daytime_activity_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (daytime_activity_level IN ('active', 'moderate', 'sedentary', '')),
    social_interaction VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (social_interaction IN ('frequent', 'moderate', 'limited', 'isolated', '')),
    environmental_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_environmental_updated_at
    BEFORE UPDATE ON assessment_environmental
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_environmental IS
    'Environmental assessment section: lighting, noise, safety, routine, and social factors. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_environmental.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_environmental.lighting_adequate IS
    'Whether evening and night-time lighting is adequate: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.lighting_notes IS
    'Details about lighting conditions and any changes needed.';
COMMENT ON COLUMN assessment_environmental.noise_level IS
    'Typical noise level in the living environment: quiet, moderate, noisy, or empty.';
COMMENT ON COLUMN assessment_environmental.temperature_comfortable IS
    'Whether the ambient temperature is comfortable: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.familiar_objects_present IS
    'Whether familiar personal objects are present in the environment: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.orientation_cues_present IS
    'Whether orientation cues (clocks, calendars, signage) are present: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.orientation_cues_details IS
    'Details of orientation cues in place.';
COMMENT ON COLUMN assessment_environmental.safe_wandering_space IS
    'Whether there is a safe space for wandering: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.exit_security IS
    'Whether exits are secured to prevent unsafe wandering: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.fall_hazards_addressed IS
    'Whether fall hazards have been addressed: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.structured_routine IS
    'Whether the patient has a structured daily routine: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.evening_routine_established IS
    'Whether a calming evening routine is established: yes, no, or empty.';
COMMENT ON COLUMN assessment_environmental.evening_routine_details IS
    'Details of the evening wind-down routine.';
COMMENT ON COLUMN assessment_environmental.daytime_activity_level IS
    'Daytime activity level: active, moderate, sedentary, or empty.';
COMMENT ON COLUMN assessment_environmental.social_interaction IS
    'Level of social interaction: frequent, moderate, limited, isolated, or empty.';
COMMENT ON COLUMN assessment_environmental.environmental_notes IS
    'Additional clinician notes on environmental assessment.';
