-- 06_assessment_communication_difficulties.sql
-- Communication difficulties section of the hearing aid assessment.

CREATE TABLE assessment_communication_difficulties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    difficulty_quiet_conversation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_quiet_conversation IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_noisy_environment VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_noisy_environment IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_group_settings VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_group_settings IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_on_telephone VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_on_telephone IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_television VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_television IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_understanding_speech VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_understanding_speech IN ('never', 'sometimes', 'often', 'always', '')),
    asks_people_to_repeat VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (asks_people_to_repeat IN ('never', 'sometimes', 'often', 'always', '')),
    lip_reading_reliance VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (lip_reading_reliance IN ('never', 'sometimes', 'often', 'always', '')),
    social_withdrawal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_withdrawal IN ('yes', 'no', '')),
    communication_partner_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (communication_partner_concerns IN ('yes', 'no', '')),
    communication_partner_details TEXT NOT NULL DEFAULT '',
    communication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_communication_difficulties_updated_at
    BEFORE UPDATE ON assessment_communication_difficulties
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_communication_difficulties IS
    'Communication difficulties section: situational hearing challenges and social impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_communication_difficulties.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_communication_difficulties.difficulty_quiet_conversation IS
    'Difficulty hearing in quiet one-to-one conversation: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.difficulty_noisy_environment IS
    'Difficulty hearing in noisy environments: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.difficulty_group_settings IS
    'Difficulty hearing in group settings: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.difficulty_on_telephone IS
    'Difficulty hearing on the telephone: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.difficulty_television IS
    'Difficulty hearing the television: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.difficulty_understanding_speech IS
    'Difficulty understanding speech (words sound muffled): never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.asks_people_to_repeat IS
    'Frequency of asking people to repeat: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.lip_reading_reliance IS
    'Reliance on lip reading: never, sometimes, often, always, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.social_withdrawal IS
    'Whether the patient has withdrawn socially due to hearing loss: yes, no, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.communication_partner_concerns IS
    'Whether a communication partner has raised concerns about hearing: yes, no, or empty string.';
COMMENT ON COLUMN assessment_communication_difficulties.communication_partner_details IS
    'Details of communication partner concerns.';
COMMENT ON COLUMN assessment_communication_difficulties.communication_notes IS
    'Free-text notes on communication difficulties.';
