-- 11_assessment_review_of_systems.sql
-- Review of systems section of the patient intake assessment.

CREATE TABLE assessment_review_of_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Constitutional
    constitutional_fever VARCHAR(5) NOT NULL DEFAULT '' CHECK (constitutional_fever IN ('yes', 'no', '')),
    constitutional_weight_loss VARCHAR(5) NOT NULL DEFAULT '' CHECK (constitutional_weight_loss IN ('yes', 'no', '')),
    constitutional_fatigue VARCHAR(5) NOT NULL DEFAULT '' CHECK (constitutional_fatigue IN ('yes', 'no', '')),
    constitutional_night_sweats VARCHAR(5) NOT NULL DEFAULT '' CHECK (constitutional_night_sweats IN ('yes', 'no', '')),

    -- Head, Eyes, Ears, Nose, Throat
    heent_headache VARCHAR(5) NOT NULL DEFAULT '' CHECK (heent_headache IN ('yes', 'no', '')),
    heent_vision_changes VARCHAR(5) NOT NULL DEFAULT '' CHECK (heent_vision_changes IN ('yes', 'no', '')),
    heent_hearing_changes VARCHAR(5) NOT NULL DEFAULT '' CHECK (heent_hearing_changes IN ('yes', 'no', '')),
    heent_sore_throat VARCHAR(5) NOT NULL DEFAULT '' CHECK (heent_sore_throat IN ('yes', 'no', '')),

    -- Cardiovascular
    cardiovascular_chest_pain VARCHAR(5) NOT NULL DEFAULT '' CHECK (cardiovascular_chest_pain IN ('yes', 'no', '')),
    cardiovascular_palpitations VARCHAR(5) NOT NULL DEFAULT '' CHECK (cardiovascular_palpitations IN ('yes', 'no', '')),
    cardiovascular_oedema VARCHAR(5) NOT NULL DEFAULT '' CHECK (cardiovascular_oedema IN ('yes', 'no', '')),
    cardiovascular_dyspnoea VARCHAR(5) NOT NULL DEFAULT '' CHECK (cardiovascular_dyspnoea IN ('yes', 'no', '')),

    -- Respiratory
    respiratory_cough VARCHAR(5) NOT NULL DEFAULT '' CHECK (respiratory_cough IN ('yes', 'no', '')),
    respiratory_wheezing VARCHAR(5) NOT NULL DEFAULT '' CHECK (respiratory_wheezing IN ('yes', 'no', '')),
    respiratory_shortness_of_breath VARCHAR(5) NOT NULL DEFAULT '' CHECK (respiratory_shortness_of_breath IN ('yes', 'no', '')),

    -- Gastrointestinal
    gi_nausea VARCHAR(5) NOT NULL DEFAULT '' CHECK (gi_nausea IN ('yes', 'no', '')),
    gi_vomiting VARCHAR(5) NOT NULL DEFAULT '' CHECK (gi_vomiting IN ('yes', 'no', '')),
    gi_abdominal_pain VARCHAR(5) NOT NULL DEFAULT '' CHECK (gi_abdominal_pain IN ('yes', 'no', '')),
    gi_diarrhoea VARCHAR(5) NOT NULL DEFAULT '' CHECK (gi_diarrhoea IN ('yes', 'no', '')),
    gi_constipation VARCHAR(5) NOT NULL DEFAULT '' CHECK (gi_constipation IN ('yes', 'no', '')),

    -- Genitourinary
    gu_frequency VARCHAR(5) NOT NULL DEFAULT '' CHECK (gu_frequency IN ('yes', 'no', '')),
    gu_urgency VARCHAR(5) NOT NULL DEFAULT '' CHECK (gu_urgency IN ('yes', 'no', '')),
    gu_dysuria VARCHAR(5) NOT NULL DEFAULT '' CHECK (gu_dysuria IN ('yes', 'no', '')),

    -- Musculoskeletal
    msk_joint_pain VARCHAR(5) NOT NULL DEFAULT '' CHECK (msk_joint_pain IN ('yes', 'no', '')),
    msk_muscle_pain VARCHAR(5) NOT NULL DEFAULT '' CHECK (msk_muscle_pain IN ('yes', 'no', '')),
    msk_swelling VARCHAR(5) NOT NULL DEFAULT '' CHECK (msk_swelling IN ('yes', 'no', '')),
    msk_stiffness VARCHAR(5) NOT NULL DEFAULT '' CHECK (msk_stiffness IN ('yes', 'no', '')),

    -- Neurological
    neuro_numbness VARCHAR(5) NOT NULL DEFAULT '' CHECK (neuro_numbness IN ('yes', 'no', '')),
    neuro_tingling VARCHAR(5) NOT NULL DEFAULT '' CHECK (neuro_tingling IN ('yes', 'no', '')),
    neuro_weakness VARCHAR(5) NOT NULL DEFAULT '' CHECK (neuro_weakness IN ('yes', 'no', '')),
    neuro_dizziness VARCHAR(5) NOT NULL DEFAULT '' CHECK (neuro_dizziness IN ('yes', 'no', '')),
    neuro_seizures VARCHAR(5) NOT NULL DEFAULT '' CHECK (neuro_seizures IN ('yes', 'no', '')),

    -- Psychiatric
    psych_depression VARCHAR(5) NOT NULL DEFAULT '' CHECK (psych_depression IN ('yes', 'no', '')),
    psych_anxiety VARCHAR(5) NOT NULL DEFAULT '' CHECK (psych_anxiety IN ('yes', 'no', '')),
    psych_sleep_disturbance VARCHAR(5) NOT NULL DEFAULT '' CHECK (psych_sleep_disturbance IN ('yes', 'no', '')),

    -- Skin
    skin_rash VARCHAR(5) NOT NULL DEFAULT '' CHECK (skin_rash IN ('yes', 'no', '')),
    skin_itching VARCHAR(5) NOT NULL DEFAULT '' CHECK (skin_itching IN ('yes', 'no', '')),
    skin_lesions VARCHAR(5) NOT NULL DEFAULT '' CHECK (skin_lesions IN ('yes', 'no', '')),

    additional_symptoms TEXT NOT NULL DEFAULT '',
    review_of_systems_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_review_of_systems_updated_at
    BEFORE UPDATE ON assessment_review_of_systems
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_review_of_systems IS
    'Review of systems section: systematic symptom review across constitutional, HEENT, cardiovascular, respiratory, GI, GU, MSK, neurological, psychiatric, and dermatological systems. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_review_of_systems.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_review_of_systems.constitutional_fever IS
    'Constitutional: fever present: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.constitutional_weight_loss IS
    'Constitutional: unexplained weight loss: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.constitutional_fatigue IS
    'Constitutional: fatigue: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.constitutional_night_sweats IS
    'Constitutional: night sweats: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.heent_headache IS
    'HEENT: headache: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.heent_vision_changes IS
    'HEENT: vision changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.heent_hearing_changes IS
    'HEENT: hearing changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.heent_sore_throat IS
    'HEENT: sore throat: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.cardiovascular_chest_pain IS
    'Cardiovascular: chest pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.cardiovascular_palpitations IS
    'Cardiovascular: palpitations: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.cardiovascular_oedema IS
    'Cardiovascular: peripheral oedema: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.cardiovascular_dyspnoea IS
    'Cardiovascular: dyspnoea on exertion: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.respiratory_cough IS
    'Respiratory: cough: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.respiratory_wheezing IS
    'Respiratory: wheezing: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.respiratory_shortness_of_breath IS
    'Respiratory: shortness of breath: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gi_nausea IS
    'Gastrointestinal: nausea: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gi_vomiting IS
    'Gastrointestinal: vomiting: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gi_abdominal_pain IS
    'Gastrointestinal: abdominal pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gi_diarrhoea IS
    'Gastrointestinal: diarrhoea: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gi_constipation IS
    'Gastrointestinal: constipation: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gu_frequency IS
    'Genitourinary: urinary frequency: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gu_urgency IS
    'Genitourinary: urinary urgency: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.gu_dysuria IS
    'Genitourinary: dysuria (painful urination): yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.msk_joint_pain IS
    'Musculoskeletal: joint pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.msk_muscle_pain IS
    'Musculoskeletal: muscle pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.msk_swelling IS
    'Musculoskeletal: swelling: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.msk_stiffness IS
    'Musculoskeletal: stiffness: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.neuro_numbness IS
    'Neurological: numbness: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.neuro_tingling IS
    'Neurological: tingling: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.neuro_weakness IS
    'Neurological: weakness: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.neuro_dizziness IS
    'Neurological: dizziness: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.neuro_seizures IS
    'Neurological: seizures: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.psych_depression IS
    'Psychiatric: depression: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.psych_anxiety IS
    'Psychiatric: anxiety: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.psych_sleep_disturbance IS
    'Psychiatric: sleep disturbance: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.skin_rash IS
    'Skin: rash: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.skin_itching IS
    'Skin: itching (pruritus): yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.skin_lesions IS
    'Skin: skin lesions or changes: yes, no, or empty.';
COMMENT ON COLUMN assessment_review_of_systems.additional_symptoms IS
    'Any additional symptoms not covered by the systems above.';
COMMENT ON COLUMN assessment_review_of_systems.review_of_systems_notes IS
    'Additional clinician notes on the review of systems.';
