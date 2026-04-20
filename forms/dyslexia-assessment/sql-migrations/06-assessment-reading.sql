-- 06_assessment_reading.sql
-- Reading assessment section of the dyslexia assessment.

CREATE TABLE assessment_reading (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reading_fluency_score INTEGER
        CHECK (reading_fluency_score IS NULL OR (reading_fluency_score >= 40 AND reading_fluency_score <= 160)),
    reading_comprehension_score INTEGER
        CHECK (reading_comprehension_score IS NULL OR (reading_comprehension_score >= 40 AND reading_comprehension_score <= 160)),
    single_word_reading_score INTEGER
        CHECK (single_word_reading_score IS NULL OR (single_word_reading_score >= 40 AND single_word_reading_score <= 160)),
    nonword_reading_score INTEGER
        CHECK (nonword_reading_score IS NULL OR (nonword_reading_score >= 40 AND nonword_reading_score <= 160)),
    reading_speed VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reading_speed IN ('above-average', 'average', 'below-average', 'significantly-below', '')),
    reading_accuracy VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reading_accuracy IN ('above-average', 'average', 'below-average', 'significantly-below', '')),
    reading_avoidance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reading_avoidance IN ('yes', 'no', '')),
    reading_fatigue VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reading_fatigue IN ('yes', 'no', '')),
    reading_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_reading_updated_at
    BEFORE UPDATE ON assessment_reading
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_reading IS
    'Reading assessment section: fluency, comprehension, word reading, nonword decoding scores and qualitative observations. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_reading.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_reading.reading_fluency_score IS
    'Standardised score for reading fluency (mean 100, SD 15).';
COMMENT ON COLUMN assessment_reading.reading_comprehension_score IS
    'Standardised score for reading comprehension (mean 100, SD 15).';
COMMENT ON COLUMN assessment_reading.single_word_reading_score IS
    'Standardised score for single word reading (mean 100, SD 15).';
COMMENT ON COLUMN assessment_reading.nonword_reading_score IS
    'Standardised score for nonword (pseudoword) reading (mean 100, SD 15).';
COMMENT ON COLUMN assessment_reading.reading_speed IS
    'Qualitative rating of reading speed: above-average, average, below-average, significantly-below, or empty.';
COMMENT ON COLUMN assessment_reading.reading_accuracy IS
    'Qualitative rating of reading accuracy: above-average, average, below-average, significantly-below, or empty.';
COMMENT ON COLUMN assessment_reading.reading_avoidance IS
    'Whether the patient avoids reading: yes, no, or empty.';
COMMENT ON COLUMN assessment_reading.reading_fatigue IS
    'Whether the patient experiences fatigue when reading: yes, no, or empty.';
COMMENT ON COLUMN assessment_reading.reading_notes IS
    'Additional clinician notes on reading assessment.';
