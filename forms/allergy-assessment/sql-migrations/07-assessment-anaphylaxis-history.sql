-- 07_assessment_anaphylaxis_history.sql
-- Anaphylaxis history section: header row and episode items.

CREATE TABLE assessment_anaphylaxis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_anaphylaxis_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_anaphylaxis_history IN ('yes', 'no', '')),
    number_of_episodes INTEGER
        CHECK (number_of_episodes IS NULL OR number_of_episodes >= 0),
    adrenaline_auto_injector_prescribed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adrenaline_auto_injector_prescribed IN ('yes', 'no', '')),
    action_plan_in_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (action_plan_in_place IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anaphylaxis_history_updated_at
    BEFORE UPDATE ON assessment_anaphylaxis_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anaphylaxis_history IS
    'Anaphylaxis history section including auto-injector and action plan status. One-to-one child of assessment.';

-- Individual anaphylaxis episode items (one-to-many child)
CREATE TABLE assessment_anaphylaxis_episode (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    anaphylaxis_history_id UUID NOT NULL
        REFERENCES assessment_anaphylaxis_history(id) ON DELETE CASCADE,

    trigger_description TEXT NOT NULL DEFAULT '',
    symptoms TEXT NOT NULL DEFAULT '',
    treatment_required TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anaphylaxis_episode_updated_at
    BEFORE UPDATE ON assessment_anaphylaxis_episode
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anaphylaxis_episode IS
    'Individual anaphylaxis episode with trigger, symptoms, and treatment details.';
