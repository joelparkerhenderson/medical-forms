-- 11_assessment_physical_cognitive_status.sql
-- Physical and cognitive status section of the occupational therapy assessment.

CREATE TABLE assessment_physical_cognitive_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    upper_limb_function VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (upper_limb_function IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    lower_limb_function VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lower_limb_function IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    grip_strength_left_kg NUMERIC(5,1)
        CHECK (grip_strength_left_kg IS NULL OR grip_strength_left_kg >= 0),
    grip_strength_right_kg NUMERIC(5,1)
        CHECK (grip_strength_right_kg IS NULL OR grip_strength_right_kg >= 0),
    pinch_strength_left_kg NUMERIC(5,1)
        CHECK (pinch_strength_left_kg IS NULL OR pinch_strength_left_kg >= 0),
    pinch_strength_right_kg NUMERIC(5,1)
        CHECK (pinch_strength_right_kg IS NULL OR pinch_strength_right_kg >= 0),
    balance_sitting VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (balance_sitting IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    balance_standing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (balance_standing IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    endurance_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (endurance_level IN ('normal', 'mildly-reduced', 'moderately-reduced', 'severely-reduced', '')),
    pain_level INTEGER
        CHECK (pain_level IS NULL OR (pain_level >= 0 AND pain_level <= 10)),
    pain_location TEXT NOT NULL DEFAULT '',
    sensation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sensation IN ('intact', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', 'absent', '')),
    cognition_orientation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognition_orientation IN ('fully-orientated', 'partially-orientated', 'disorientated', '')),
    cognition_memory VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognition_memory IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    cognition_attention VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognition_attention IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    cognition_executive_function VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognition_executive_function IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    cognition_perception VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognition_perception IN ('normal', 'mildly-impaired', 'moderately-impaired', 'severely-impaired', '')),
    vision VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vision IN ('normal', 'corrected', 'impaired', 'severely-impaired', '')),
    hearing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hearing IN ('normal', 'corrected', 'impaired', 'severely-impaired', '')),
    physical_cognitive_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_physical_cognitive_status_updated_at
    BEFORE UPDATE ON assessment_physical_cognitive_status
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_physical_cognitive_status IS
    'Physical and cognitive status section: motor function, strength, balance, cognition, and sensory assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_physical_cognitive_status.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_physical_cognitive_status.upper_limb_function IS
    'Functional status of upper limbs: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.lower_limb_function IS
    'Functional status of lower limbs: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.grip_strength_left_kg IS
    'Grip strength of the left hand in kilograms (measured by dynamometer).';
COMMENT ON COLUMN assessment_physical_cognitive_status.grip_strength_right_kg IS
    'Grip strength of the right hand in kilograms (measured by dynamometer).';
COMMENT ON COLUMN assessment_physical_cognitive_status.pinch_strength_left_kg IS
    'Pinch strength of the left hand in kilograms.';
COMMENT ON COLUMN assessment_physical_cognitive_status.pinch_strength_right_kg IS
    'Pinch strength of the right hand in kilograms.';
COMMENT ON COLUMN assessment_physical_cognitive_status.balance_sitting IS
    'Sitting balance assessment: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.balance_standing IS
    'Standing balance assessment: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.endurance_level IS
    'Physical endurance level: normal, mildly-reduced, moderately-reduced, severely-reduced, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.pain_level IS
    'Pain level on a 0-10 numeric rating scale (0 = no pain, 10 = worst pain).';
COMMENT ON COLUMN assessment_physical_cognitive_status.pain_location IS
    'Description of primary pain location(s).';
COMMENT ON COLUMN assessment_physical_cognitive_status.sensation IS
    'Sensation assessment: intact, mildly-impaired, moderately-impaired, severely-impaired, absent, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.cognition_orientation IS
    'Orientation assessment: fully-orientated, partially-orientated, disorientated, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.cognition_memory IS
    'Memory function: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.cognition_attention IS
    'Attention and concentration: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.cognition_executive_function IS
    'Executive function (planning, problem-solving): normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.cognition_perception IS
    'Perceptual function: normal, mildly-impaired, moderately-impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.vision IS
    'Vision status: normal, corrected, impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.hearing IS
    'Hearing status: normal, corrected, impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_physical_cognitive_status.physical_cognitive_notes IS
    'Additional clinician notes on physical and cognitive status.';
