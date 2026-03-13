-- 10_assessment_repetition_commands.sql
-- Repetition and commands section of the cognitive assessment (MMSE items 25-27).

CREATE TABLE assessment_repetition_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Three-stage command: "Take this paper in your right hand, fold it in half, and put it on the floor" (3 points)
    command_take_paper VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (command_take_paper IN ('correct', 'incorrect', '')),
    command_fold_paper VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (command_fold_paper IN ('correct', 'incorrect', '')),
    command_put_on_floor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (command_put_on_floor IN ('correct', 'incorrect', '')),
    three_stage_command_score INTEGER
        CHECK (three_stage_command_score IS NULL OR (three_stage_command_score >= 0 AND three_stage_command_score <= 3)),

    -- Reading: "Close your eyes" (1 point)
    reading_instruction_followed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reading_instruction_followed IN ('correct', 'incorrect', '')),
    reading_score INTEGER
        CHECK (reading_score IS NULL OR (reading_score >= 0 AND reading_score <= 1)),

    -- Writing: write a sentence (1 point)
    writing_sentence_produced VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (writing_sentence_produced IN ('correct', 'incorrect', '')),
    writing_score INTEGER
        CHECK (writing_score IS NULL OR (writing_score >= 0 AND writing_score <= 1)),

    commands_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_repetition_commands_updated_at
    BEFORE UPDATE ON assessment_repetition_commands
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_repetition_commands IS
    'Repetition and commands section (MMSE items 25-27): three-stage command (3 points), reading (1 point), writing (1 point). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_repetition_commands.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_repetition_commands.command_take_paper IS
    'Three-stage command step 1 (take paper in right hand): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_repetition_commands.command_fold_paper IS
    'Three-stage command step 2 (fold in half): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_repetition_commands.command_put_on_floor IS
    'Three-stage command step 3 (put on the floor): correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_repetition_commands.three_stage_command_score IS
    'Subtotal score for three-stage command, 0-3.';
COMMENT ON COLUMN assessment_repetition_commands.reading_instruction_followed IS
    'Whether the patient read and followed the written instruction to close eyes: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_repetition_commands.reading_score IS
    'Subtotal score for reading, 0-1.';
COMMENT ON COLUMN assessment_repetition_commands.writing_sentence_produced IS
    'Whether the patient wrote a meaningful sentence: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_repetition_commands.writing_score IS
    'Subtotal score for writing, 0-1.';
COMMENT ON COLUMN assessment_repetition_commands.commands_notes IS
    'Additional clinician notes on commands, reading, and writing assessment.';
