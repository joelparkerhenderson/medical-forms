-- 08_assessment_recall.sql
-- Recall section of the cognitive assessment (MMSE items 19-21).

CREATE TABLE assessment_recall (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Delayed recall of the three registration words (3 points)
    word_1_recalled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (word_1_recalled IN ('correct', 'incorrect', '')),
    word_2_recalled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (word_2_recalled IN ('correct', 'incorrect', '')),
    word_3_recalled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (word_3_recalled IN ('correct', 'incorrect', '')),
    recall_score INTEGER
        CHECK (recall_score IS NULL OR (recall_score >= 0 AND recall_score <= 3)),
    cueing_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cueing_required IN ('yes', 'no', '')),
    cueing_details TEXT NOT NULL DEFAULT '',
    recall_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_recall_updated_at
    BEFORE UPDATE ON assessment_recall
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_recall IS
    'Recall section (MMSE items 19-21): delayed recall of the three registration words (3 points). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_recall.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_recall.word_1_recalled IS
    'Whether the patient recalled word 1 after delay: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_recall.word_2_recalled IS
    'Whether the patient recalled word 2 after delay: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_recall.word_3_recalled IS
    'Whether the patient recalled word 3 after delay: correct, incorrect, or empty.';
COMMENT ON COLUMN assessment_recall.recall_score IS
    'Subtotal score for recall, 0-3.';
COMMENT ON COLUMN assessment_recall.cueing_required IS
    'Whether cueing was required to assist recall: yes, no, or empty.';
COMMENT ON COLUMN assessment_recall.cueing_details IS
    'Details of cueing provided (category cue, phonemic cue).';
COMMENT ON COLUMN assessment_recall.recall_notes IS
    'Additional clinician notes on recall assessment.';
