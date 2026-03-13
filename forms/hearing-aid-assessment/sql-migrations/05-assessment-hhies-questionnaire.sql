-- 05_assessment_hhies_questionnaire.sql
-- HHIE-S (Hearing Handicap Inventory for the Elderly - Screening) questionnaire section.

CREATE TABLE assessment_hhies_questionnaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- HHIE-S 10 items, each scored 0 (no), 2 (sometimes), 4 (yes)
    s1_telephone_difficulty INTEGER
        CHECK (s1_telephone_difficulty IS NULL OR s1_telephone_difficulty IN (0, 2, 4)),
    s2_embarrassment INTEGER
        CHECK (s2_embarrassment IS NULL OR s2_embarrassment IN (0, 2, 4)),
    s3_difficulty_group_conversation INTEGER
        CHECK (s3_difficulty_group_conversation IS NULL OR s3_difficulty_group_conversation IN (0, 2, 4)),
    s4_handicapped_feeling INTEGER
        CHECK (s4_handicapped_feeling IS NULL OR s4_handicapped_feeling IN (0, 2, 4)),
    s5_difficulty_visiting INTEGER
        CHECK (s5_difficulty_visiting IS NULL OR s5_difficulty_visiting IN (0, 2, 4)),
    s6_difficulty_religious_services INTEGER
        CHECK (s6_difficulty_religious_services IS NULL OR s6_difficulty_religious_services IN (0, 2, 4)),
    s7_arguments_due_to_hearing INTEGER
        CHECK (s7_arguments_due_to_hearing IS NULL OR s7_arguments_due_to_hearing IN (0, 2, 4)),
    s8_difficulty_tv_radio INTEGER
        CHECK (s8_difficulty_tv_radio IS NULL OR s8_difficulty_tv_radio IN (0, 2, 4)),
    s9_personal_social_life_affected INTEGER
        CHECK (s9_personal_social_life_affected IS NULL OR s9_personal_social_life_affected IN (0, 2, 4)),
    s10_difficulty_restaurant INTEGER
        CHECK (s10_difficulty_restaurant IS NULL OR s10_difficulty_restaurant IN (0, 2, 4)),

    hhies_total_score INTEGER
        CHECK (hhies_total_score IS NULL OR (hhies_total_score >= 0 AND hhies_total_score <= 40)),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_hhies_questionnaire_updated_at
    BEFORE UPDATE ON assessment_hhies_questionnaire
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_hhies_questionnaire IS
    'HHIE-S questionnaire: 10 items scored 0/2/4, total 0-40. 0-8 = No handicap, 10-24 = Mild-moderate, 26-40 = Significant. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_hhies_questionnaire.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_hhies_questionnaire.s1_telephone_difficulty IS
    'S1: Does a hearing problem cause you to use the telephone less often? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s2_embarrassment IS
    'S2: Does a hearing problem cause you to feel embarrassed? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s3_difficulty_group_conversation IS
    'S3: Do you have difficulty hearing when someone speaks in a whisper? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s4_handicapped_feeling IS
    'S4: Do you feel handicapped by a hearing problem? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s5_difficulty_visiting IS
    'S5: Does a hearing problem cause you difficulty visiting friends, relatives, or neighbours? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s6_difficulty_religious_services IS
    'S6: Does a hearing problem cause you to attend religious services less often? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s7_arguments_due_to_hearing IS
    'S7: Does a hearing problem cause you to have arguments with family members? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s8_difficulty_tv_radio IS
    'S8: Does a hearing problem cause you difficulty listening to TV or radio? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s9_personal_social_life_affected IS
    'S9: Do you feel that any difficulty with hearing limits your personal or social life? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.s10_difficulty_restaurant IS
    'S10: Does a hearing problem cause you difficulty in a restaurant? 0=No, 2=Sometimes, 4=Yes.';
COMMENT ON COLUMN assessment_hhies_questionnaire.hhies_total_score IS
    'Total HHIE-S score (0-40), NULL if not all items answered.';
