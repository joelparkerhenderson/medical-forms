-- 08_assessment_limb_ataxia_sensory.sql
-- Limb ataxia and sensory examination section of the stroke assessment (NIHSS items 7-8).

CREATE TABLE assessment_limb_ataxia_sensory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS 7: Limb ataxia
    nihss_7_limb_ataxia INTEGER
        CHECK (nihss_7_limb_ataxia IS NULL OR (nihss_7_limb_ataxia >= 0 AND nihss_7_limb_ataxia <= 2)),

    -- NIHSS 8: Sensory
    nihss_8_sensory INTEGER
        CHECK (nihss_8_sensory IS NULL OR (nihss_8_sensory >= 0 AND nihss_8_sensory <= 2)),

    ataxia_present_left_arm VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ataxia_present_left_arm IN ('yes', 'no', '')),
    ataxia_present_right_arm VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ataxia_present_right_arm IN ('yes', 'no', '')),
    ataxia_present_left_leg VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ataxia_present_left_leg IN ('yes', 'no', '')),
    ataxia_present_right_leg VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ataxia_present_right_leg IN ('yes', 'no', '')),
    finger_to_nose_test VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (finger_to_nose_test IN ('normal', 'abnormal_left', 'abnormal_right', 'abnormal_bilateral', '')),
    heel_to_shin_test VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (heel_to_shin_test IN ('normal', 'abnormal_left', 'abnormal_right', 'abnormal_bilateral', '')),
    sensory_loss_pattern VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (sensory_loss_pattern IN ('none', 'mild_to_moderate', 'severe_to_total', '')),
    sensory_loss_side VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (sensory_loss_side IN ('left', 'right', 'bilateral', 'none', '')),
    sensory_modalities_affected TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_limb_ataxia_sensory_updated_at
    BEFORE UPDATE ON assessment_limb_ataxia_sensory
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_limb_ataxia_sensory IS
    'Limb ataxia and sensory section (NIHSS items 7-8): cerebellar function and somatosensory examination. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.nihss_7_limb_ataxia IS
    'NIHSS 7: 0=absent, 1=present in one limb, 2=present in two or more limbs.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.nihss_8_sensory IS
    'NIHSS 8: 0=normal, 1=mild-to-moderate sensory loss, 2=severe or total sensory loss.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.ataxia_present_left_arm IS
    'Whether ataxia is present in the left arm.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.ataxia_present_right_arm IS
    'Whether ataxia is present in the right arm.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.ataxia_present_left_leg IS
    'Whether ataxia is present in the left leg.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.ataxia_present_right_leg IS
    'Whether ataxia is present in the right leg.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.finger_to_nose_test IS
    'Finger-to-nose test result: normal, abnormal_left, abnormal_right, abnormal_bilateral, or empty string.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.heel_to_shin_test IS
    'Heel-to-shin test result: normal, abnormal_left, abnormal_right, abnormal_bilateral, or empty string.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.sensory_loss_pattern IS
    'Pattern of sensory loss: none, mild_to_moderate, severe_to_total, or empty string.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.sensory_loss_side IS
    'Side of sensory loss: left, right, bilateral, none, or empty string.';
COMMENT ON COLUMN assessment_limb_ataxia_sensory.sensory_modalities_affected IS
    'Sensory modalities affected (e.g. light touch, pinprick, proprioception, temperature).';
