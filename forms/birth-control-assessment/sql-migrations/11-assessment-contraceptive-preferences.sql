-- 11_assessment_contraceptive_preferences.sql
-- Contraceptive preferences section of the birth control assessment.

CREATE TABLE assessment_contraceptive_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_method VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (preferred_method IN ('coc', 'pop', 'implant', 'injection', 'iud', 'ius', 'patch', 'ring', 'barrier', 'natural', 'unsure', '')),
    hormonal_acceptable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hormonal_acceptable IN ('yes', 'no', '')),
    long_acting_acceptable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (long_acting_acceptable IN ('yes', 'no', '')),
    daily_pill_acceptable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (daily_pill_acceptable IN ('yes', 'no', '')),
    intrauterine_acceptable VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (intrauterine_acceptable IN ('yes', 'no', '')),
    fertility_plans VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (fertility_plans IN ('within-1-year', '1-5-years', 'no-plans', 'completed-family', '')),
    breastfeeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (breastfeeding IN ('yes', 'no', '')),
    postpartum_weeks INTEGER
        CHECK (postpartum_weeks IS NULL OR postpartum_weeks >= 0),
    concerns TEXT NOT NULL DEFAULT '',
    preference_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_contraceptive_preferences_updated_at
    BEFORE UPDATE ON assessment_contraceptive_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_contraceptive_preferences IS
    'Contraceptive preferences section: preferred methods, acceptability, fertility plans, and concerns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_contraceptive_preferences.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_contraceptive_preferences.preferred_method IS
    'Patient preferred contraceptive method: coc, pop, implant, injection, iud, ius, patch, ring, barrier, natural, unsure, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.hormonal_acceptable IS
    'Whether hormonal methods are acceptable to the patient: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.long_acting_acceptable IS
    'Whether long-acting reversible contraception is acceptable: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.daily_pill_acceptable IS
    'Whether a daily pill is acceptable: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.intrauterine_acceptable IS
    'Whether intrauterine methods are acceptable: yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.fertility_plans IS
    'Future fertility plans: within-1-year, 1-5-years, no-plans, completed-family, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.breastfeeding IS
    'Whether the patient is currently breastfeeding (UK MEC 4 for COC if <6 weeks postpartum): yes, no, or empty.';
COMMENT ON COLUMN assessment_contraceptive_preferences.postpartum_weeks IS
    'Number of weeks postpartum if applicable.';
COMMENT ON COLUMN assessment_contraceptive_preferences.concerns IS
    'Patient concerns or questions about contraception.';
COMMENT ON COLUMN assessment_contraceptive_preferences.preference_notes IS
    'Additional clinician notes on contraceptive preferences.';
