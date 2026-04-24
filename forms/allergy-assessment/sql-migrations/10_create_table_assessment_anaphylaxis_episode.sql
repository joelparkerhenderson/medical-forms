CREATE TABLE assessment_anaphylaxis_episode (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    anaphylaxis_history_id UUID NOT NULL
        REFERENCES assessment_anaphylaxis_history(id) ON DELETE CASCADE,
    trigger_description TEXT NOT NULL DEFAULT '',
    symptoms TEXT NOT NULL DEFAULT '',
    treatment_required TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_assessment_anaphylaxis_episode_updated_at
    BEFORE UPDATE ON assessment_anaphylaxis_episode
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anaphylaxis_episode IS
    'Individual anaphylaxis episode with trigger, symptoms, and treatment details.';

COMMENT ON COLUMN assessment_anaphylaxis_history.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_anaphylaxis_history.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN assessment_anaphylaxis_history.has_anaphylaxis_history IS
    'Has anaphylaxis history. One of: yes, no.';
COMMENT ON COLUMN assessment_anaphylaxis_history.number_of_episodes IS
    'Number of episodes.';
COMMENT ON COLUMN assessment_anaphylaxis_history.adrenaline_auto_injector_prescribed IS
    'Adrenaline auto injector prescribed. One of: yes, no.';
COMMENT ON COLUMN assessment_anaphylaxis_history.action_plan_in_place IS
    'Action plan in place. One of: yes, no.';
COMMENT ON COLUMN assessment_anaphylaxis_history.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_anaphylaxis_history.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.anaphylaxis_history_id IS
    'Foreign key to the assessment_anaphylaxis_history table.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.trigger_description IS
    'Trigger description.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.symptoms IS
    'Symptoms.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.treatment_required IS
    'Treatment required.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.sort_order IS
    'Sort order.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_anaphylaxis_episode.deleted_at IS
    'Timestamp when this row was deleted.';
