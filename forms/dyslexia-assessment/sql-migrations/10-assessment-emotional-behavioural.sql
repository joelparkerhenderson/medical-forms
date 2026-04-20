-- 10_assessment_emotional_behavioural.sql
-- Emotional and behavioural impact section of the dyslexia assessment.

CREATE TABLE assessment_emotional_behavioural (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    self_esteem VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (self_esteem IN ('good', 'adequate', 'low', 'very-low', '')),
    anxiety_about_learning VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_about_learning IN ('yes', 'no', '')),
    anxiety_details TEXT NOT NULL DEFAULT '',
    frustration_with_tasks VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (frustration_with_tasks IN ('yes', 'no', '')),
    frustration_details TEXT NOT NULL DEFAULT '',
    avoidance_behaviours VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (avoidance_behaviours IN ('yes', 'no', '')),
    avoidance_details TEXT NOT NULL DEFAULT '',
    peer_relationships VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (peer_relationships IN ('good', 'adequate', 'difficulties', 'significant-difficulties', '')),
    behavioural_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (behavioural_concerns IN ('yes', 'no', '')),
    behavioural_concerns_details TEXT NOT NULL DEFAULT '',
    motivation_for_learning VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (motivation_for_learning IN ('high', 'moderate', 'low', 'very-low', '')),
    emotional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_emotional_behavioural_updated_at
    BEFORE UPDATE ON assessment_emotional_behavioural
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_emotional_behavioural IS
    'Emotional and behavioural impact section: self-esteem, anxiety, frustration, avoidance, peer relationships. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_emotional_behavioural.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_emotional_behavioural.self_esteem IS
    'Self-esteem level: good, adequate, low, very-low, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.anxiety_about_learning IS
    'Whether the patient experiences anxiety about learning: yes, no, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.anxiety_details IS
    'Details of learning-related anxiety.';
COMMENT ON COLUMN assessment_emotional_behavioural.frustration_with_tasks IS
    'Whether the patient becomes frustrated with academic tasks: yes, no, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.frustration_details IS
    'Details of task-related frustration.';
COMMENT ON COLUMN assessment_emotional_behavioural.avoidance_behaviours IS
    'Whether the patient shows avoidance behaviours: yes, no, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.avoidance_details IS
    'Details of avoidance behaviours.';
COMMENT ON COLUMN assessment_emotional_behavioural.peer_relationships IS
    'Quality of peer relationships: good, adequate, difficulties, significant-difficulties, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.behavioural_concerns IS
    'Whether there are behavioural concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.behavioural_concerns_details IS
    'Details of behavioural concerns.';
COMMENT ON COLUMN assessment_emotional_behavioural.motivation_for_learning IS
    'Motivation for learning: high, moderate, low, very-low, or empty.';
COMMENT ON COLUMN assessment_emotional_behavioural.emotional_notes IS
    'Additional clinician notes on emotional and behavioural impact.';
