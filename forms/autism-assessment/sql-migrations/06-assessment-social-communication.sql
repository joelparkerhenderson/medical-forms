-- 06_assessment_social_communication.sql
-- Social communication section of the autism assessment.

CREATE TABLE assessment_social_communication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    eye_contact_difficulty VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (eye_contact_difficulty IN ('never', 'sometimes', 'often', 'always', '')),
    understanding_sarcasm VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (understanding_sarcasm IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_starting_conversations VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_starting_conversations IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_maintaining_conversations VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_maintaining_conversations IN ('never', 'sometimes', 'often', 'always', '')),
    literal_interpretation VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (literal_interpretation IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_reading_body_language VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_reading_body_language IN ('never', 'sometimes', 'often', 'always', '')),
    difficulty_making_friends VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (difficulty_making_friends IN ('never', 'sometimes', 'often', 'always', '')),
    preference_for_solitary_activities VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (preference_for_solitary_activities IN ('never', 'sometimes', 'often', 'always', '')),
    social_communication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_communication_updated_at
    BEFORE UPDATE ON assessment_social_communication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_communication IS
    'Social communication section: eye contact, conversation skills, social understanding, and friendships. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_communication.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_communication.eye_contact_difficulty IS
    'Frequency of difficulty maintaining eye contact: never, sometimes, often, always, or empty.';
COMMENT ON COLUMN assessment_social_communication.understanding_sarcasm IS
    'Frequency of difficulty understanding sarcasm or irony.';
COMMENT ON COLUMN assessment_social_communication.difficulty_starting_conversations IS
    'Frequency of difficulty initiating conversations.';
COMMENT ON COLUMN assessment_social_communication.difficulty_maintaining_conversations IS
    'Frequency of difficulty keeping conversations going.';
COMMENT ON COLUMN assessment_social_communication.literal_interpretation IS
    'Frequency of interpreting language literally.';
COMMENT ON COLUMN assessment_social_communication.difficulty_reading_body_language IS
    'Frequency of difficulty reading non-verbal cues.';
COMMENT ON COLUMN assessment_social_communication.difficulty_making_friends IS
    'Frequency of difficulty forming friendships.';
COMMENT ON COLUMN assessment_social_communication.preference_for_solitary_activities IS
    'Frequency of preferring to do things alone.';
COMMENT ON COLUMN assessment_social_communication.social_communication_notes IS
    'Additional clinician or patient notes on social communication.';
