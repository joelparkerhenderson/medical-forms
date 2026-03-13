-- 05_assessment_movement_history.sql
-- Movement history section of the kinesiology assessment.

CREATE TABLE assessment_movement_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    current_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_pain IN ('yes', 'no', '')),
    pain_location TEXT NOT NULL DEFAULT '',
    pain_severity INTEGER
        CHECK (pain_severity IS NULL OR (pain_severity >= 0 AND pain_severity <= 10)),
    pain_duration VARCHAR(50) NOT NULL DEFAULT '',
    previous_injuries TEXT NOT NULL DEFAULT '',
    previous_surgeries TEXT NOT NULL DEFAULT '',
    chronic_conditions TEXT NOT NULL DEFAULT '',
    movement_limitations TEXT NOT NULL DEFAULT '',
    exercise_frequency VARCHAR(50) NOT NULL DEFAULT '',
    exercise_type TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_movement_history_updated_at
    BEFORE UPDATE ON assessment_movement_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_movement_history IS
    'Movement history section: current pain, injuries, surgeries, chronic conditions, and exercise habits. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_movement_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_movement_history.current_pain IS
    'Whether the patient is currently experiencing pain: yes, no, or empty string.';
COMMENT ON COLUMN assessment_movement_history.pain_location IS
    'Free-text description of pain location(s).';
COMMENT ON COLUMN assessment_movement_history.pain_severity IS
    'Pain severity on a 0-10 numeric rating scale (NRS).';
COMMENT ON COLUMN assessment_movement_history.pain_duration IS
    'Duration of the current pain episode.';
COMMENT ON COLUMN assessment_movement_history.previous_injuries IS
    'Free-text description of prior musculoskeletal injuries.';
COMMENT ON COLUMN assessment_movement_history.previous_surgeries IS
    'Free-text description of previous surgeries relevant to movement.';
COMMENT ON COLUMN assessment_movement_history.chronic_conditions IS
    'Free-text description of chronic conditions affecting movement.';
COMMENT ON COLUMN assessment_movement_history.movement_limitations IS
    'Free-text description of known movement limitations.';
COMMENT ON COLUMN assessment_movement_history.exercise_frequency IS
    'How often the patient exercises (e.g. daily, 3x/week).';
COMMENT ON COLUMN assessment_movement_history.exercise_type IS
    'Types of exercise the patient typically performs.';
