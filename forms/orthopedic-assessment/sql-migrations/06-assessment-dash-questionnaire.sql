-- 06_assessment_dash_questionnaire.sql
-- DASH (Disabilities of the Arm, Shoulder and Hand) questionnaire section.

CREATE TABLE assessment_dash_questionnaire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- DASH items 1-30: functional ability (1=no difficulty, 5=unable)
    q01_open_jar INTEGER CHECK (q01_open_jar IS NULL OR (q01_open_jar >= 1 AND q01_open_jar <= 5)),
    q02_write INTEGER CHECK (q02_write IS NULL OR (q02_write >= 1 AND q02_write <= 5)),
    q03_turn_key INTEGER CHECK (q03_turn_key IS NULL OR (q03_turn_key >= 1 AND q03_turn_key <= 5)),
    q04_prepare_meal INTEGER CHECK (q04_prepare_meal IS NULL OR (q04_prepare_meal >= 1 AND q04_prepare_meal <= 5)),
    q05_push_door INTEGER CHECK (q05_push_door IS NULL OR (q05_push_door >= 1 AND q05_push_door <= 5)),
    q06_place_object_shelf INTEGER CHECK (q06_place_object_shelf IS NULL OR (q06_place_object_shelf >= 1 AND q06_place_object_shelf <= 5)),
    q07_heavy_household INTEGER CHECK (q07_heavy_household IS NULL OR (q07_heavy_household >= 1 AND q07_heavy_household <= 5)),
    q08_garden_yard INTEGER CHECK (q08_garden_yard IS NULL OR (q08_garden_yard >= 1 AND q08_garden_yard <= 5)),
    q09_make_bed INTEGER CHECK (q09_make_bed IS NULL OR (q09_make_bed >= 1 AND q09_make_bed <= 5)),
    q10_carry_bag INTEGER CHECK (q10_carry_bag IS NULL OR (q10_carry_bag >= 1 AND q10_carry_bag <= 5)),
    q11_carry_heavy INTEGER CHECK (q11_carry_heavy IS NULL OR (q11_carry_heavy >= 1 AND q11_carry_heavy <= 5)),
    q12_overhead INTEGER CHECK (q12_overhead IS NULL OR (q12_overhead >= 1 AND q12_overhead <= 5)),
    q13_wash_back INTEGER CHECK (q13_wash_back IS NULL OR (q13_wash_back >= 1 AND q13_wash_back <= 5)),
    q14_use_knife INTEGER CHECK (q14_use_knife IS NULL OR (q14_use_knife >= 1 AND q14_use_knife <= 5)),
    q15_recreational_force INTEGER CHECK (q15_recreational_force IS NULL OR (q15_recreational_force >= 1 AND q15_recreational_force <= 5)),
    q16_recreational_arm INTEGER CHECK (q16_recreational_arm IS NULL OR (q16_recreational_arm >= 1 AND q16_recreational_arm <= 5)),
    q17_transportation INTEGER CHECK (q17_transportation IS NULL OR (q17_transportation >= 1 AND q17_transportation <= 5)),
    q18_sexual_activity INTEGER CHECK (q18_sexual_activity IS NULL OR (q18_sexual_activity >= 1 AND q18_sexual_activity <= 5)),
    q19_family_care INTEGER CHECK (q19_family_care IS NULL OR (q19_family_care >= 1 AND q19_family_care <= 5)),
    q20_social_activity INTEGER CHECK (q20_social_activity IS NULL OR (q20_social_activity >= 1 AND q20_social_activity <= 5)),
    q21_limited_work INTEGER CHECK (q21_limited_work IS NULL OR (q21_limited_work >= 1 AND q21_limited_work <= 5)),
    q22_usual_work INTEGER CHECK (q22_usual_work IS NULL OR (q22_usual_work >= 1 AND q22_usual_work <= 5)),
    q23_arm_pain INTEGER CHECK (q23_arm_pain IS NULL OR (q23_arm_pain >= 1 AND q23_arm_pain <= 5)),
    q24_arm_pain_activity INTEGER CHECK (q24_arm_pain_activity IS NULL OR (q24_arm_pain_activity >= 1 AND q24_arm_pain_activity <= 5)),
    q25_tingling INTEGER CHECK (q25_tingling IS NULL OR (q25_tingling >= 1 AND q25_tingling <= 5)),
    q26_weakness INTEGER CHECK (q26_weakness IS NULL OR (q26_weakness >= 1 AND q26_weakness <= 5)),
    q27_stiffness INTEGER CHECK (q27_stiffness IS NULL OR (q27_stiffness >= 1 AND q27_stiffness <= 5)),
    q28_sleep_difficulty INTEGER CHECK (q28_sleep_difficulty IS NULL OR (q28_sleep_difficulty >= 1 AND q28_sleep_difficulty <= 5)),
    q29_less_capable INTEGER CHECK (q29_less_capable IS NULL OR (q29_less_capable >= 1 AND q29_less_capable <= 5)),
    q30_less_confident INTEGER CHECK (q30_less_confident IS NULL OR (q30_less_confident >= 1 AND q30_less_confident <= 5)),
    items_answered INTEGER
        CHECK (items_answered IS NULL OR (items_answered >= 0 AND items_answered <= 30)),
    dash_score NUMERIC(5,1)
        CHECK (dash_score IS NULL OR (dash_score >= 0 AND dash_score <= 100)),
    dash_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_dash_questionnaire_updated_at
    BEFORE UPDATE ON assessment_dash_questionnaire
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_dash_questionnaire IS
    'DASH questionnaire section: 30-item standardised instrument measuring upper extremity disability. Score 0 = no disability, 100 = most severe disability. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_dash_questionnaire.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_dash_questionnaire.q01_open_jar IS
    'DASH Q1: Open a tight or new jar (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q02_write IS
    'DASH Q2: Write (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q03_turn_key IS
    'DASH Q3: Turn a key (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q04_prepare_meal IS
    'DASH Q4: Prepare a meal (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q05_push_door IS
    'DASH Q5: Push open a heavy door (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q06_place_object_shelf IS
    'DASH Q6: Place an object on a shelf above head (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q07_heavy_household IS
    'DASH Q7: Do heavy household chores (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q08_garden_yard IS
    'DASH Q8: Garden or do yard work (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q09_make_bed IS
    'DASH Q9: Make a bed (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q10_carry_bag IS
    'DASH Q10: Carry a shopping bag or briefcase (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q11_carry_heavy IS
    'DASH Q11: Carry a heavy object over 5 kg (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q12_overhead IS
    'DASH Q12: Change a light bulb overhead (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q13_wash_back IS
    'DASH Q13: Wash or blow dry hair (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q14_use_knife IS
    'DASH Q14: Use a knife to cut food (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q15_recreational_force IS
    'DASH Q15: Recreational activities requiring force through arm (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q16_recreational_arm IS
    'DASH Q16: Recreational activities moving arm freely (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q17_transportation IS
    'DASH Q17: Manage transportation needs (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q18_sexual_activity IS
    'DASH Q18: Sexual activities (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q19_family_care IS
    'DASH Q19: Family care or other dependents (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q20_social_activity IS
    'DASH Q20: Social activity limited by arm/shoulder/hand problem (1=not at all, 5=extremely).';
COMMENT ON COLUMN assessment_dash_questionnaire.q21_limited_work IS
    'DASH Q21: Limited in work or other daily activities (1=not limited, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q22_usual_work IS
    'DASH Q22: Usual work difficulty (1=no difficulty, 5=unable).';
COMMENT ON COLUMN assessment_dash_questionnaire.q23_arm_pain IS
    'DASH Q23: Arm, shoulder, or hand pain (1=none, 5=extreme).';
COMMENT ON COLUMN assessment_dash_questionnaire.q24_arm_pain_activity IS
    'DASH Q24: Arm, shoulder, or hand pain during specific activity (1=none, 5=extreme).';
COMMENT ON COLUMN assessment_dash_questionnaire.q25_tingling IS
    'DASH Q25: Tingling (pins and needles) in arm, shoulder, or hand (1=none, 5=extreme).';
COMMENT ON COLUMN assessment_dash_questionnaire.q26_weakness IS
    'DASH Q26: Weakness in arm, shoulder, or hand (1=none, 5=extreme).';
COMMENT ON COLUMN assessment_dash_questionnaire.q27_stiffness IS
    'DASH Q27: Stiffness in arm, shoulder, or hand (1=none, 5=extreme).';
COMMENT ON COLUMN assessment_dash_questionnaire.q28_sleep_difficulty IS
    'DASH Q28: Difficulty sleeping due to pain (1=no difficulty, 5=so difficult cannot sleep).';
COMMENT ON COLUMN assessment_dash_questionnaire.q29_less_capable IS
    'DASH Q29: Feel less capable, confident, or useful (1=strongly disagree, 5=strongly agree).';
COMMENT ON COLUMN assessment_dash_questionnaire.q30_less_confident IS
    'DASH Q30: Less confident (1=strongly disagree, 5=strongly agree).';
COMMENT ON COLUMN assessment_dash_questionnaire.items_answered IS
    'Number of DASH items answered (minimum 27 required for valid score).';
COMMENT ON COLUMN assessment_dash_questionnaire.dash_score IS
    'Computed DASH score: ((sum of items / number answered) - 1) * 25. Range 0-100.';
COMMENT ON COLUMN assessment_dash_questionnaire.dash_notes IS
    'Additional notes on the DASH questionnaire completion.';
