-- 08_assessment_motor_and_sensory_exam.sql
-- Motor and sensory examination section of the neurology assessment.

CREATE TABLE assessment_motor_and_sensory_exam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Motor exam: muscle strength using MRC scale (0-5)
    upper_limb_power_left INTEGER
        CHECK (upper_limb_power_left IS NULL OR (upper_limb_power_left >= 0 AND upper_limb_power_left <= 5)),
    upper_limb_power_right INTEGER
        CHECK (upper_limb_power_right IS NULL OR (upper_limb_power_right >= 0 AND upper_limb_power_right <= 5)),
    lower_limb_power_left INTEGER
        CHECK (lower_limb_power_left IS NULL OR (lower_limb_power_left >= 0 AND lower_limb_power_left <= 5)),
    lower_limb_power_right INTEGER
        CHECK (lower_limb_power_right IS NULL OR (lower_limb_power_right >= 0 AND lower_limb_power_right <= 5)),
    grip_strength_left INTEGER
        CHECK (grip_strength_left IS NULL OR (grip_strength_left >= 0 AND grip_strength_left <= 5)),
    grip_strength_right INTEGER
        CHECK (grip_strength_right IS NULL OR (grip_strength_right >= 0 AND grip_strength_right <= 5)),

    -- Tone
    upper_limb_tone_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (upper_limb_tone_left IN ('normal', 'hypotonia', 'spasticity', 'rigidity', 'clonus', '')),
    upper_limb_tone_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (upper_limb_tone_right IN ('normal', 'hypotonia', 'spasticity', 'rigidity', 'clonus', '')),
    lower_limb_tone_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lower_limb_tone_left IN ('normal', 'hypotonia', 'spasticity', 'rigidity', 'clonus', '')),
    lower_limb_tone_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lower_limb_tone_right IN ('normal', 'hypotonia', 'spasticity', 'rigidity', 'clonus', '')),

    -- Reflexes (0-4 scale)
    biceps_reflex_left INTEGER
        CHECK (biceps_reflex_left IS NULL OR (biceps_reflex_left >= 0 AND biceps_reflex_left <= 4)),
    biceps_reflex_right INTEGER
        CHECK (biceps_reflex_right IS NULL OR (biceps_reflex_right >= 0 AND biceps_reflex_right <= 4)),
    knee_reflex_left INTEGER
        CHECK (knee_reflex_left IS NULL OR (knee_reflex_left >= 0 AND knee_reflex_left <= 4)),
    knee_reflex_right INTEGER
        CHECK (knee_reflex_right IS NULL OR (knee_reflex_right >= 0 AND knee_reflex_right <= 4)),
    ankle_reflex_left INTEGER
        CHECK (ankle_reflex_left IS NULL OR (ankle_reflex_left >= 0 AND ankle_reflex_left <= 4)),
    ankle_reflex_right INTEGER
        CHECK (ankle_reflex_right IS NULL OR (ankle_reflex_right >= 0 AND ankle_reflex_right <= 4)),
    plantar_response_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (plantar_response_left IN ('flexor', 'extensor', 'equivocal', 'absent', '')),
    plantar_response_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (plantar_response_right IN ('flexor', 'extensor', 'equivocal', 'absent', '')),

    -- Sensory exam
    light_touch_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (light_touch_intact IN ('yes', 'no', '')),
    light_touch_deficit_area TEXT NOT NULL DEFAULT '',
    pinprick_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pinprick_intact IN ('yes', 'no', '')),
    pinprick_deficit_area TEXT NOT NULL DEFAULT '',
    proprioception_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (proprioception_intact IN ('yes', 'no', '')),
    vibration_sense_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vibration_sense_intact IN ('yes', 'no', '')),

    -- Coordination
    finger_nose_test_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (finger_nose_test_left IN ('normal', 'dysmetria', 'intention-tremor', '')),
    finger_nose_test_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (finger_nose_test_right IN ('normal', 'dysmetria', 'intention-tremor', '')),
    heel_shin_test_left VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (heel_shin_test_left IN ('normal', 'ataxic', '')),
    heel_shin_test_right VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (heel_shin_test_right IN ('normal', 'ataxic', '')),
    romberg_test VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (romberg_test IN ('negative', 'positive', '')),

    motor_sensory_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_motor_and_sensory_exam_updated_at
    BEFORE UPDATE ON assessment_motor_and_sensory_exam
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_motor_and_sensory_exam IS
    'Motor and sensory examination section: muscle power (MRC scale), tone, reflexes, sensory modalities, and coordination. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.upper_limb_power_left IS
    'Left upper limb power on MRC scale (0 = no contraction, 5 = normal).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.upper_limb_power_right IS
    'Right upper limb power on MRC scale (0-5).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.lower_limb_power_left IS
    'Left lower limb power on MRC scale (0-5).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.lower_limb_power_right IS
    'Right lower limb power on MRC scale (0-5).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.grip_strength_left IS
    'Left grip strength on MRC scale (0-5).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.grip_strength_right IS
    'Right grip strength on MRC scale (0-5).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.upper_limb_tone_left IS
    'Left upper limb tone: normal, hypotonia, spasticity, rigidity, clonus, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.upper_limb_tone_right IS
    'Right upper limb tone.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.lower_limb_tone_left IS
    'Left lower limb tone.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.lower_limb_tone_right IS
    'Right lower limb tone.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.biceps_reflex_left IS
    'Left biceps reflex (0 = absent, 1 = diminished, 2 = normal, 3 = brisk, 4 = clonus).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.biceps_reflex_right IS
    'Right biceps reflex (0-4 scale).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.knee_reflex_left IS
    'Left knee (patellar) reflex (0-4 scale).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.knee_reflex_right IS
    'Right knee (patellar) reflex (0-4 scale).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.ankle_reflex_left IS
    'Left ankle (Achilles) reflex (0-4 scale).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.ankle_reflex_right IS
    'Right ankle (Achilles) reflex (0-4 scale).';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.plantar_response_left IS
    'Left plantar response: flexor (normal), extensor (Babinski positive), equivocal, absent, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.plantar_response_right IS
    'Right plantar response.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.light_touch_intact IS
    'Whether light touch sensation is intact: yes, no, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.light_touch_deficit_area IS
    'Free-text description of light touch deficit distribution.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.pinprick_intact IS
    'Whether pinprick (pain) sensation is intact: yes, no, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.pinprick_deficit_area IS
    'Free-text description of pinprick deficit distribution.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.proprioception_intact IS
    'Whether proprioception (joint position sense) is intact: yes, no, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.vibration_sense_intact IS
    'Whether vibration sense is intact: yes, no, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.finger_nose_test_left IS
    'Left finger-nose test: normal, dysmetria, intention-tremor, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.finger_nose_test_right IS
    'Right finger-nose test.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.heel_shin_test_left IS
    'Left heel-shin test: normal, ataxic, or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.heel_shin_test_right IS
    'Right heel-shin test.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.romberg_test IS
    'Romberg test result: negative (normal), positive (proprioceptive deficit), or empty string.';
COMMENT ON COLUMN assessment_motor_and_sensory_exam.motor_sensory_notes IS
    'Free-text clinician notes on motor and sensory examination.';
