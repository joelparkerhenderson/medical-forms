-- 08_assessment_phonological_processing.sql
-- Phonological processing section of the dyslexia assessment.

CREATE TABLE assessment_phonological_processing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    phonological_awareness_score INTEGER
        CHECK (phonological_awareness_score IS NULL OR (phonological_awareness_score >= 40 AND phonological_awareness_score <= 160)),
    phonological_memory_score INTEGER
        CHECK (phonological_memory_score IS NULL OR (phonological_memory_score >= 40 AND phonological_memory_score <= 160)),
    rapid_naming_score INTEGER
        CHECK (rapid_naming_score IS NULL OR (rapid_naming_score >= 40 AND rapid_naming_score <= 160)),
    rhyme_detection VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (rhyme_detection IN ('intact', 'impaired', 'severely-impaired', '')),
    phoneme_segmentation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (phoneme_segmentation IN ('intact', 'impaired', 'severely-impaired', '')),
    phoneme_blending VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (phoneme_blending IN ('intact', 'impaired', 'severely-impaired', '')),
    phoneme_manipulation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (phoneme_manipulation IN ('intact', 'impaired', 'severely-impaired', '')),
    rapid_naming_difficulty VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rapid_naming_difficulty IN ('yes', 'no', '')),
    phonological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_phonological_processing_updated_at
    BEFORE UPDATE ON assessment_phonological_processing
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_phonological_processing IS
    'Phonological processing section: awareness, memory, rapid naming scores and qualitative assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_phonological_processing.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_phonological_processing.phonological_awareness_score IS
    'Standardised score for phonological awareness (mean 100, SD 15).';
COMMENT ON COLUMN assessment_phonological_processing.phonological_memory_score IS
    'Standardised score for phonological memory (mean 100, SD 15).';
COMMENT ON COLUMN assessment_phonological_processing.rapid_naming_score IS
    'Standardised score for rapid automatised naming (mean 100, SD 15).';
COMMENT ON COLUMN assessment_phonological_processing.rhyme_detection IS
    'Rhyme detection ability: intact, impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_phonological_processing.phoneme_segmentation IS
    'Phoneme segmentation ability: intact, impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_phonological_processing.phoneme_blending IS
    'Phoneme blending ability: intact, impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_phonological_processing.phoneme_manipulation IS
    'Phoneme manipulation ability: intact, impaired, severely-impaired, or empty.';
COMMENT ON COLUMN assessment_phonological_processing.rapid_naming_difficulty IS
    'Whether the patient has difficulty with rapid automatised naming: yes, no, or empty.';
COMMENT ON COLUMN assessment_phonological_processing.phonological_notes IS
    'Additional clinician notes on phonological processing.';
