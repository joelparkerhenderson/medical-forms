-- 09_assessment_cognitive.sql
-- Cognitive assessment section of the neurology assessment.

CREATE TABLE assessment_cognitive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cognitive_complaint VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cognitive_complaint IN ('yes', 'no', '')),
    cognitive_complaint_details TEXT NOT NULL DEFAULT '',
    orientation_person VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_person IN ('yes', 'no', '')),
    orientation_place VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_place IN ('yes', 'no', '')),
    orientation_time VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_time IN ('yes', 'no', '')),
    attention_intact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (attention_intact IN ('yes', 'no', '')),
    memory_immediate VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (memory_immediate IN ('intact', 'impaired', '')),
    memory_delayed VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (memory_delayed IN ('intact', 'impaired', '')),
    language_fluency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (language_fluency IN ('fluent', 'non-fluent', 'global-aphasia', '')),
    naming VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (naming IN ('intact', 'impaired', '')),
    comprehension VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (comprehension IN ('intact', 'impaired', '')),
    repetition VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (repetition IN ('intact', 'impaired', '')),
    reading VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reading IN ('intact', 'impaired', '')),
    writing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (writing IN ('intact', 'impaired', '')),
    visuospatial VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (visuospatial IN ('intact', 'impaired', '')),
    executive_function VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (executive_function IN ('intact', 'impaired', '')),
    mmse_score INTEGER
        CHECK (mmse_score IS NULL OR (mmse_score >= 0 AND mmse_score <= 30)),
    moca_score INTEGER
        CHECK (moca_score IS NULL OR (moca_score >= 0 AND moca_score <= 30)),
    cognitive_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cognitive_updated_at
    BEFORE UPDATE ON assessment_cognitive
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cognitive IS
    'Cognitive assessment section: orientation, memory, language, visuospatial, executive function, and screening scores. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cognitive.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cognitive.cognitive_complaint IS
    'Whether the patient reports cognitive complaints: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cognitive.cognitive_complaint_details IS
    'Free-text description of cognitive complaints.';
COMMENT ON COLUMN assessment_cognitive.orientation_person IS
    'Whether the patient is oriented to person: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cognitive.orientation_place IS
    'Whether the patient is oriented to place: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cognitive.orientation_time IS
    'Whether the patient is oriented to time: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cognitive.attention_intact IS
    'Whether attention and concentration are intact: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cognitive.memory_immediate IS
    'Immediate (short-term) memory: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.memory_delayed IS
    'Delayed recall memory: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.language_fluency IS
    'Language fluency: fluent, non-fluent, global-aphasia, or empty string.';
COMMENT ON COLUMN assessment_cognitive.naming IS
    'Naming ability: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.comprehension IS
    'Language comprehension: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.repetition IS
    'Repetition ability: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.reading IS
    'Reading ability: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.writing IS
    'Writing ability: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.visuospatial IS
    'Visuospatial function: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.executive_function IS
    'Executive function: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive.mmse_score IS
    'Mini-Mental State Examination score (0-30). Normal >= 24.';
COMMENT ON COLUMN assessment_cognitive.moca_score IS
    'Montreal Cognitive Assessment score (0-30). Normal >= 26.';
COMMENT ON COLUMN assessment_cognitive.cognitive_notes IS
    'Free-text clinician notes on cognitive assessment.';
