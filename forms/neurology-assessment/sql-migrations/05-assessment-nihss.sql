-- 05_assessment_nihss.sql
-- NIHSS (National Institutes of Health Stroke Scale) section of the neurology assessment.

CREATE TABLE assessment_nihss (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS items (15 items, total 0-42)
    q1a_level_of_consciousness INTEGER
        CHECK (q1a_level_of_consciousness IS NULL OR (q1a_level_of_consciousness >= 0 AND q1a_level_of_consciousness <= 3)),
    q1b_loc_questions INTEGER
        CHECK (q1b_loc_questions IS NULL OR (q1b_loc_questions >= 0 AND q1b_loc_questions <= 2)),
    q1c_loc_commands INTEGER
        CHECK (q1c_loc_commands IS NULL OR (q1c_loc_commands >= 0 AND q1c_loc_commands <= 2)),
    q2_best_gaze INTEGER
        CHECK (q2_best_gaze IS NULL OR (q2_best_gaze >= 0 AND q2_best_gaze <= 2)),
    q3_visual_fields INTEGER
        CHECK (q3_visual_fields IS NULL OR (q3_visual_fields >= 0 AND q3_visual_fields <= 3)),
    q4_facial_palsy INTEGER
        CHECK (q4_facial_palsy IS NULL OR (q4_facial_palsy >= 0 AND q4_facial_palsy <= 3)),
    q5a_motor_left_arm INTEGER
        CHECK (q5a_motor_left_arm IS NULL OR (q5a_motor_left_arm >= 0 AND q5a_motor_left_arm <= 4)),
    q5b_motor_right_arm INTEGER
        CHECK (q5b_motor_right_arm IS NULL OR (q5b_motor_right_arm >= 0 AND q5b_motor_right_arm <= 4)),
    q6a_motor_left_leg INTEGER
        CHECK (q6a_motor_left_leg IS NULL OR (q6a_motor_left_leg >= 0 AND q6a_motor_left_leg <= 4)),
    q6b_motor_right_leg INTEGER
        CHECK (q6b_motor_right_leg IS NULL OR (q6b_motor_right_leg >= 0 AND q6b_motor_right_leg <= 4)),
    q7_limb_ataxia INTEGER
        CHECK (q7_limb_ataxia IS NULL OR (q7_limb_ataxia >= 0 AND q7_limb_ataxia <= 2)),
    q8_sensory INTEGER
        CHECK (q8_sensory IS NULL OR (q8_sensory >= 0 AND q8_sensory <= 2)),
    q9_best_language INTEGER
        CHECK (q9_best_language IS NULL OR (q9_best_language >= 0 AND q9_best_language <= 3)),
    q10_dysarthria INTEGER
        CHECK (q10_dysarthria IS NULL OR (q10_dysarthria >= 0 AND q10_dysarthria <= 2)),
    q11_extinction_inattention INTEGER
        CHECK (q11_extinction_inattention IS NULL OR (q11_extinction_inattention >= 0 AND q11_extinction_inattention <= 2)),
    nihss_total_score INTEGER
        CHECK (nihss_total_score IS NULL OR (nihss_total_score >= 0 AND nihss_total_score <= 42)),
    assessment_datetime TIMESTAMPTZ,
    nihss_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_nihss_updated_at
    BEFORE UPDATE ON assessment_nihss
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_nihss IS
    'NIHSS (National Institutes of Health Stroke Scale) section: 15-item stroke severity scale. Total score 0-42. 0 = no symptoms, 1-4 minor, 5-15 moderate, 16-20 moderate-to-severe, 21-42 severe. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_nihss.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_nihss.q1a_level_of_consciousness IS
    'NIHSS 1a: Level of consciousness (0 = alert, 1 = not alert but arousable, 2 = not alert requiring stimulation, 3 = unresponsive).';
COMMENT ON COLUMN assessment_nihss.q1b_loc_questions IS
    'NIHSS 1b: LOC questions - month and age (0 = both correct, 1 = one correct, 2 = neither correct).';
COMMENT ON COLUMN assessment_nihss.q1c_loc_commands IS
    'NIHSS 1c: LOC commands - open/close eyes, grip/release (0 = both correct, 1 = one correct, 2 = neither correct).';
COMMENT ON COLUMN assessment_nihss.q2_best_gaze IS
    'NIHSS 2: Best gaze (0 = normal, 1 = partial gaze palsy, 2 = forced deviation).';
COMMENT ON COLUMN assessment_nihss.q3_visual_fields IS
    'NIHSS 3: Visual fields (0 = no visual loss, 1 = partial hemianopia, 2 = complete hemianopia, 3 = bilateral hemianopia).';
COMMENT ON COLUMN assessment_nihss.q4_facial_palsy IS
    'NIHSS 4: Facial palsy (0 = normal, 1 = minor paralysis, 2 = partial paralysis, 3 = complete paralysis).';
COMMENT ON COLUMN assessment_nihss.q5a_motor_left_arm IS
    'NIHSS 5a: Motor arm - left (0 = no drift, 1 = drift, 2 = some effort against gravity, 3 = no effort against gravity, 4 = no movement).';
COMMENT ON COLUMN assessment_nihss.q5b_motor_right_arm IS
    'NIHSS 5b: Motor arm - right (0-4 scale as per left arm).';
COMMENT ON COLUMN assessment_nihss.q6a_motor_left_leg IS
    'NIHSS 6a: Motor leg - left (0 = no drift, 1 = drift, 2 = some effort against gravity, 3 = no effort against gravity, 4 = no movement).';
COMMENT ON COLUMN assessment_nihss.q6b_motor_right_leg IS
    'NIHSS 6b: Motor leg - right (0-4 scale as per left leg).';
COMMENT ON COLUMN assessment_nihss.q7_limb_ataxia IS
    'NIHSS 7: Limb ataxia (0 = absent, 1 = present in one limb, 2 = present in two limbs).';
COMMENT ON COLUMN assessment_nihss.q8_sensory IS
    'NIHSS 8: Sensory (0 = normal, 1 = mild-to-moderate sensory loss, 2 = severe or total sensory loss).';
COMMENT ON COLUMN assessment_nihss.q9_best_language IS
    'NIHSS 9: Best language (0 = no aphasia, 1 = mild-to-moderate aphasia, 2 = severe aphasia, 3 = mute/global aphasia).';
COMMENT ON COLUMN assessment_nihss.q10_dysarthria IS
    'NIHSS 10: Dysarthria (0 = normal, 1 = mild-to-moderate dysarthria, 2 = severe dysarthria/anarthria).';
COMMENT ON COLUMN assessment_nihss.q11_extinction_inattention IS
    'NIHSS 11: Extinction and inattention (0 = no abnormality, 1 = inattention in one modality, 2 = profound hemi-inattention).';
COMMENT ON COLUMN assessment_nihss.nihss_total_score IS
    'NIHSS total score (sum of all items, range 0-42).';
COMMENT ON COLUMN assessment_nihss.assessment_datetime IS
    'Date and time when the NIHSS was performed.';
COMMENT ON COLUMN assessment_nihss.nihss_notes IS
    'Free-text clinician notes on the NIHSS assessment.';
