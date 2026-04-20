-- 07_assessment_writing_spelling.sql
-- Writing and spelling assessment section of the dyslexia assessment.

CREATE TABLE assessment_writing_spelling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    spelling_score INTEGER
        CHECK (spelling_score IS NULL OR (spelling_score >= 40 AND spelling_score <= 160)),
    written_expression_score INTEGER
        CHECK (written_expression_score IS NULL OR (written_expression_score >= 40 AND written_expression_score <= 160)),
    handwriting_quality VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (handwriting_quality IN ('legible', 'somewhat-legible', 'illegible', '')),
    handwriting_speed VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (handwriting_speed IN ('above-average', 'average', 'below-average', 'significantly-below', '')),
    spelling_error_pattern VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (spelling_error_pattern IN ('phonetic', 'non-phonetic', 'mixed', 'other', '')),
    sentence_structure VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sentence_structure IN ('age-appropriate', 'below-age', 'significantly-below', '')),
    punctuation_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (punctuation_use IN ('age-appropriate', 'below-age', 'significantly-below', '')),
    writing_avoidance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (writing_avoidance IN ('yes', 'no', '')),
    writing_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_writing_spelling_updated_at
    BEFORE UPDATE ON assessment_writing_spelling
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_writing_spelling IS
    'Writing and spelling section: spelling score, written expression, handwriting, error patterns. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_writing_spelling.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_writing_spelling.spelling_score IS
    'Standardised score for spelling accuracy (mean 100, SD 15).';
COMMENT ON COLUMN assessment_writing_spelling.written_expression_score IS
    'Standardised score for written expression (mean 100, SD 15).';
COMMENT ON COLUMN assessment_writing_spelling.handwriting_quality IS
    'Handwriting quality: legible, somewhat-legible, illegible, or empty.';
COMMENT ON COLUMN assessment_writing_spelling.handwriting_speed IS
    'Handwriting speed: above-average, average, below-average, significantly-below, or empty.';
COMMENT ON COLUMN assessment_writing_spelling.spelling_error_pattern IS
    'Predominant spelling error pattern: phonetic, non-phonetic, mixed, other, or empty.';
COMMENT ON COLUMN assessment_writing_spelling.sentence_structure IS
    'Sentence structure level: age-appropriate, below-age, significantly-below, or empty.';
COMMENT ON COLUMN assessment_writing_spelling.punctuation_use IS
    'Punctuation use level: age-appropriate, below-age, significantly-below, or empty.';
COMMENT ON COLUMN assessment_writing_spelling.writing_avoidance IS
    'Whether the patient avoids writing: yes, no, or empty.';
COMMENT ON COLUMN assessment_writing_spelling.writing_notes IS
    'Additional clinician notes on writing and spelling assessment.';
