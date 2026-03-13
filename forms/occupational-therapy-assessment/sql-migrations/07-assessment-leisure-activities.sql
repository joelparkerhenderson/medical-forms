-- 07_assessment_leisure_activities.sql
-- Leisure activities section of the occupational therapy assessment (COPM domain).

CREATE TABLE assessment_leisure_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    quiet_recreation TEXT NOT NULL DEFAULT '',
    active_recreation TEXT NOT NULL DEFAULT '',
    socialisation TEXT NOT NULL DEFAULT '',
    hobbies_and_interests TEXT NOT NULL DEFAULT '',
    leisure_participation_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (leisure_participation_level IN ('full', 'reduced', 'minimal', 'none', '')),
    barriers_to_leisure TEXT NOT NULL DEFAULT '',
    previous_leisure_activities TEXT NOT NULL DEFAULT '',
    activities_given_up TEXT NOT NULL DEFAULT '',
    leisure_satisfaction VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (leisure_satisfaction IN ('very-satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very-dissatisfied', '')),
    leisure_concerns TEXT NOT NULL DEFAULT '',
    leisure_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_leisure_activities_updated_at
    BEFORE UPDATE ON assessment_leisure_activities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_leisure_activities IS
    'Leisure activities section: recreation, socialisation, hobbies, and participation levels. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_leisure_activities.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_leisure_activities.quiet_recreation IS
    'Description of quiet recreation activities (reading, crafts, watching TV).';
COMMENT ON COLUMN assessment_leisure_activities.active_recreation IS
    'Description of active recreation activities (sport, exercise, gardening).';
COMMENT ON COLUMN assessment_leisure_activities.socialisation IS
    'Description of social activities and engagement level.';
COMMENT ON COLUMN assessment_leisure_activities.hobbies_and_interests IS
    'List of current hobbies and interests.';
COMMENT ON COLUMN assessment_leisure_activities.leisure_participation_level IS
    'Overall level of participation in leisure activities: full, reduced, minimal, none, or empty.';
COMMENT ON COLUMN assessment_leisure_activities.barriers_to_leisure IS
    'Barriers preventing full participation in leisure activities.';
COMMENT ON COLUMN assessment_leisure_activities.previous_leisure_activities IS
    'Leisure activities the patient enjoyed before their condition.';
COMMENT ON COLUMN assessment_leisure_activities.activities_given_up IS
    'Activities the patient has had to give up due to their condition.';
COMMENT ON COLUMN assessment_leisure_activities.leisure_satisfaction IS
    'Patient satisfaction with current leisure participation.';
COMMENT ON COLUMN assessment_leisure_activities.leisure_concerns IS
    'Specific leisure-related concerns raised by the patient.';
COMMENT ON COLUMN assessment_leisure_activities.leisure_notes IS
    'Additional clinician notes on leisure performance.';
