-- 08_assessment_communication_preferences.sql
-- Communication preferences section of the advance statement about care.

CREATE TABLE assessment_communication_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    preferred_language VARCHAR(100) NOT NULL DEFAULT '',
    communication_aids TEXT NOT NULL DEFAULT '',
    how_to_share_information TEXT NOT NULL DEFAULT '',
    who_to_involve_in_decisions TEXT NOT NULL DEFAULT '',
    information_sharing_restrictions TEXT NOT NULL DEFAULT '',
    preferred_communication_style TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_communication_preferences_updated_at
    BEFORE UPDATE ON assessment_communication_preferences
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_communication_preferences IS
    'Communication preferences section: how the person wishes to receive information and communicate with care teams. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_communication_preferences.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_communication_preferences.preferred_language IS
    'Preferred language for communication.';
COMMENT ON COLUMN assessment_communication_preferences.communication_aids IS
    'Any communication aids needed (e.g. hearing aid, interpreter, large print).';
COMMENT ON COLUMN assessment_communication_preferences.how_to_share_information IS
    'How the person prefers to receive health information (e.g. verbal, written, diagrams).';
COMMENT ON COLUMN assessment_communication_preferences.who_to_involve_in_decisions IS
    'People the person wants involved in care decisions.';
COMMENT ON COLUMN assessment_communication_preferences.information_sharing_restrictions IS
    'Any restrictions on who should or should not be given information about the person.';
COMMENT ON COLUMN assessment_communication_preferences.preferred_communication_style IS
    'Preferred style of communication (e.g. direct, gentle, detailed).';
