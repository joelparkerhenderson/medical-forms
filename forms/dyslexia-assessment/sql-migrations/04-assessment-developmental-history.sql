-- 04_assessment_developmental_history.sql
-- Developmental history section of the dyslexia assessment.

CREATE TABLE assessment_developmental_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    birth_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (birth_complications IN ('yes', 'no', '')),
    birth_complications_details TEXT NOT NULL DEFAULT '',
    speech_delay VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (speech_delay IN ('yes', 'no', '')),
    speech_delay_details TEXT NOT NULL DEFAULT '',
    motor_delay VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (motor_delay IN ('yes', 'no', '')),
    motor_delay_details TEXT NOT NULL DEFAULT '',
    family_history_dyslexia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_dyslexia IN ('yes', 'no', '')),
    family_history_details TEXT NOT NULL DEFAULT '',
    family_history_other_learning_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_other_learning_difficulties IN ('yes', 'no', '')),
    family_history_other_details TEXT NOT NULL DEFAULT '',
    hearing_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hearing_concerns IN ('yes', 'no', '')),
    hearing_concerns_details TEXT NOT NULL DEFAULT '',
    vision_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vision_concerns IN ('yes', 'no', '')),
    vision_concerns_details TEXT NOT NULL DEFAULT '',
    developmental_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_developmental_history_updated_at
    BEFORE UPDATE ON assessment_developmental_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_developmental_history IS
    'Developmental history section: birth, speech, motor milestones, family history, sensory concerns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_developmental_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_developmental_history.birth_complications IS
    'Whether there were birth complications: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.birth_complications_details IS
    'Details of birth complications if present.';
COMMENT ON COLUMN assessment_developmental_history.speech_delay IS
    'Whether speech development was delayed: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.speech_delay_details IS
    'Details of speech delay if present.';
COMMENT ON COLUMN assessment_developmental_history.motor_delay IS
    'Whether motor development was delayed: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.motor_delay_details IS
    'Details of motor delay if present.';
COMMENT ON COLUMN assessment_developmental_history.family_history_dyslexia IS
    'Whether there is a family history of dyslexia: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.family_history_details IS
    'Details of family history of dyslexia.';
COMMENT ON COLUMN assessment_developmental_history.family_history_other_learning_difficulties IS
    'Whether there is a family history of other learning difficulties: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.family_history_other_details IS
    'Details of family history of other learning difficulties.';
COMMENT ON COLUMN assessment_developmental_history.hearing_concerns IS
    'Whether there are hearing concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.hearing_concerns_details IS
    'Details of hearing concerns if present.';
COMMENT ON COLUMN assessment_developmental_history.vision_concerns IS
    'Whether there are vision concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.vision_concerns_details IS
    'Details of vision concerns if present.';
COMMENT ON COLUMN assessment_developmental_history.developmental_notes IS
    'Additional clinician notes on developmental history.';
