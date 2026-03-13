-- 11_assessment_expectations_and_goals.sql
-- Expectations and goals section of the hearing aid assessment.

CREATE TABLE assessment_expectations_and_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    motivation_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (motivation_level IN ('very-motivated', 'motivated', 'neutral', 'reluctant', '')),
    self_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_referral IN ('yes', 'no', '')),
    referral_source VARCHAR(50) NOT NULL DEFAULT '',
    primary_goal TEXT NOT NULL DEFAULT '',
    secondary_goal TEXT NOT NULL DEFAULT '',
    realistic_expectations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (realistic_expectations IN ('yes', 'no', '')),
    willingness_to_wear_daily VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (willingness_to_wear_daily IN ('yes', 'no', '')),
    support_from_family VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (support_from_family IN ('yes', 'no', '')),
    previous_hearing_aid_experience VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (previous_hearing_aid_experience IN ('positive', 'negative', 'neutral', 'none', '')),
    concerns_about_hearing_aids TEXT NOT NULL DEFAULT '',
    preferred_hearing_aid_style VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (preferred_hearing_aid_style IN ('bte', 'ite', 'ric', 'cic', 'no-preference', '')),
    follow_up_commitment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (follow_up_commitment IN ('yes', 'no', '')),
    expectations_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_expectations_and_goals_updated_at
    BEFORE UPDATE ON assessment_expectations_and_goals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_expectations_and_goals IS
    'Expectations and goals section: motivation, goals, realistic expectations, and hearing aid preferences. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_expectations_and_goals.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_expectations_and_goals.motivation_level IS
    'Patient motivation level: very-motivated, motivated, neutral, reluctant, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.self_referral IS
    'Whether this is a self-referral: yes, no, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.referral_source IS
    'Source of referral if not self-referred (e.g. GP, family member).';
COMMENT ON COLUMN assessment_expectations_and_goals.primary_goal IS
    'Primary goal for hearing aid use.';
COMMENT ON COLUMN assessment_expectations_and_goals.secondary_goal IS
    'Secondary goal for hearing aid use.';
COMMENT ON COLUMN assessment_expectations_and_goals.realistic_expectations IS
    'Whether the patient has realistic expectations about hearing aids: yes, no, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.willingness_to_wear_daily IS
    'Whether the patient is willing to wear hearing aids daily: yes, no, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.support_from_family IS
    'Whether there is family support for hearing aid use: yes, no, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.previous_hearing_aid_experience IS
    'Previous experience with hearing aids: positive, negative, neutral, none, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.concerns_about_hearing_aids IS
    'Free-text description of concerns about hearing aids.';
COMMENT ON COLUMN assessment_expectations_and_goals.preferred_hearing_aid_style IS
    'Preferred hearing aid style: bte, ite, ric, cic, no-preference, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.follow_up_commitment IS
    'Whether the patient can commit to follow-up appointments: yes, no, or empty string.';
COMMENT ON COLUMN assessment_expectations_and_goals.expectations_notes IS
    'Free-text notes on expectations and goals.';
