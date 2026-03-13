-- 09_assessment_language_dysarthria.sql
-- Language and dysarthria section of the stroke assessment (NIHSS items 9-10).

CREATE TABLE assessment_language_dysarthria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- NIHSS 9: Best language
    nihss_9_best_language INTEGER
        CHECK (nihss_9_best_language IS NULL OR (nihss_9_best_language >= 0 AND nihss_9_best_language <= 3)),

    -- NIHSS 10: Dysarthria
    nihss_10_dysarthria INTEGER
        CHECK (nihss_10_dysarthria IS NULL OR (nihss_10_dysarthria >= 0 AND nihss_10_dysarthria <= 2)),

    aphasia_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (aphasia_type IN ('none', 'broca', 'wernicke', 'global', 'anomic', 'conduction', 'transcortical', '')),
    speech_fluency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (speech_fluency IN ('fluent', 'non_fluent', 'mute', '')),
    comprehension_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (comprehension_intact IN ('yes', 'no', '')),
    repetition_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (repetition_intact IN ('yes', 'no', '')),
    naming_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (naming_intact IN ('yes', 'no', '')),
    reading_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reading_intact IN ('yes', 'no', '')),
    writing_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (writing_intact IN ('yes', 'no', '')),
    dysarthria_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dysarthria_severity IN ('none', 'mild', 'moderate', 'severe', 'anarthric', '')),
    language_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_language_dysarthria_updated_at
    BEFORE UPDATE ON assessment_language_dysarthria
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_language_dysarthria IS
    'Language and dysarthria section (NIHSS items 9-10): aphasia classification and speech motor function. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_language_dysarthria.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_language_dysarthria.nihss_9_best_language IS
    'NIHSS 9: 0=no aphasia, 1=mild-to-moderate aphasia, 2=severe aphasia, 3=mute/global aphasia.';
COMMENT ON COLUMN assessment_language_dysarthria.nihss_10_dysarthria IS
    'NIHSS 10: 0=normal, 1=mild-to-moderate (slurs some words), 2=severe (unintelligible or mute).';
COMMENT ON COLUMN assessment_language_dysarthria.aphasia_type IS
    'Aphasia classification: none, broca, wernicke, global, anomic, conduction, transcortical, or empty string.';
COMMENT ON COLUMN assessment_language_dysarthria.speech_fluency IS
    'Speech fluency: fluent, non_fluent, mute, or empty string.';
COMMENT ON COLUMN assessment_language_dysarthria.comprehension_intact IS
    'Whether auditory comprehension is intact.';
COMMENT ON COLUMN assessment_language_dysarthria.repetition_intact IS
    'Whether repetition ability is intact.';
COMMENT ON COLUMN assessment_language_dysarthria.naming_intact IS
    'Whether naming ability is intact.';
COMMENT ON COLUMN assessment_language_dysarthria.reading_intact IS
    'Whether reading ability is intact.';
COMMENT ON COLUMN assessment_language_dysarthria.writing_intact IS
    'Whether writing ability is intact.';
COMMENT ON COLUMN assessment_language_dysarthria.dysarthria_severity IS
    'Dysarthria severity: none, mild, moderate, severe, anarthric, or empty string.';
COMMENT ON COLUMN assessment_language_dysarthria.language_notes IS
    'Free-text notes on language examination findings.';
