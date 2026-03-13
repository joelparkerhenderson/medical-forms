-- 10_assessment_lifestyle_and_needs.sql
-- Lifestyle and needs section of the hearing aid assessment.

CREATE TABLE assessment_lifestyle_and_needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    primary_listening_environment VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (primary_listening_environment IN ('quiet-home', 'noisy-work', 'social-events', 'outdoor', 'mixed', '')),
    frequent_phone_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (frequent_phone_use IN ('yes', 'no', '')),
    frequent_music_listening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (frequent_music_listening IN ('yes', 'no', '')),
    active_social_life VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_social_life IN ('yes', 'no', '')),
    exercises_regularly VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (exercises_regularly IN ('yes', 'no', '')),
    dexterity_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dexterity_issues IN ('yes', 'no', '')),
    dexterity_details TEXT NOT NULL DEFAULT '',
    vision_issues VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vision_issues IN ('yes', 'no', '')),
    vision_details TEXT NOT NULL DEFAULT '',
    cognitive_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cognitive_concerns IN ('yes', 'no', '')),
    technology_comfort VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (technology_comfort IN ('very-comfortable', 'comfortable', 'some-difficulty', 'significant-difficulty', '')),
    smartphone_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (smartphone_use IN ('yes', 'no', '')),
    bluetooth_connectivity_desired VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bluetooth_connectivity_desired IN ('yes', 'no', '')),
    cosmetic_preference VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cosmetic_preference IN ('discreet', 'no-preference', 'visible-acceptable', '')),
    budget_considerations TEXT NOT NULL DEFAULT '',
    lifestyle_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lifestyle_and_needs_updated_at
    BEFORE UPDATE ON assessment_lifestyle_and_needs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lifestyle_and_needs IS
    'Lifestyle and needs section: listening environments, dexterity, technology comfort, and cosmetic preferences. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_lifestyle_and_needs.primary_listening_environment IS
    'Primary listening environment: quiet-home, noisy-work, social-events, outdoor, mixed, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.frequent_phone_use IS
    'Whether the patient frequently uses the telephone: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.frequent_music_listening IS
    'Whether the patient frequently listens to music: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.active_social_life IS
    'Whether the patient has an active social life: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.exercises_regularly IS
    'Whether the patient exercises regularly: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.dexterity_issues IS
    'Whether the patient has dexterity issues affecting hearing aid handling: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.dexterity_details IS
    'Details of dexterity issues.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.vision_issues IS
    'Whether the patient has vision issues: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.vision_details IS
    'Details of vision issues.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.cognitive_concerns IS
    'Whether there are cognitive concerns affecting hearing aid use: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.technology_comfort IS
    'Comfort level with technology: very-comfortable, comfortable, some-difficulty, significant-difficulty, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.smartphone_use IS
    'Whether the patient uses a smartphone: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.bluetooth_connectivity_desired IS
    'Whether Bluetooth connectivity is desired: yes, no, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.cosmetic_preference IS
    'Cosmetic preference: discreet, no-preference, visible-acceptable, or empty string.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.budget_considerations IS
    'Free-text description of budget considerations.';
COMMENT ON COLUMN assessment_lifestyle_and_needs.lifestyle_notes IS
    'Free-text notes on lifestyle and needs.';
