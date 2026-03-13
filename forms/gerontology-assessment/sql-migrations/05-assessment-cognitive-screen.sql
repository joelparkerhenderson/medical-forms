-- 05_assessment_cognitive_screen.sql
-- Cognitive screening section of the gerontology assessment.

CREATE TABLE assessment_cognitive_screen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mmse_score INTEGER
        CHECK (mmse_score IS NULL OR (mmse_score >= 0 AND mmse_score <= 30)),
    moca_score INTEGER
        CHECK (moca_score IS NULL OR (moca_score >= 0 AND moca_score <= 30)),
    clock_drawing_score INTEGER
        CHECK (clock_drawing_score IS NULL OR (clock_drawing_score >= 0 AND clock_drawing_score <= 6)),
    orientation_to_time VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (orientation_to_time IN ('intact', 'impaired', '')),
    orientation_to_place VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (orientation_to_place IN ('intact', 'impaired', '')),
    short_term_memory VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (short_term_memory IN ('intact', 'impaired', '')),
    long_term_memory VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (long_term_memory IN ('intact', 'impaired', '')),
    executive_function VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (executive_function IN ('intact', 'impaired', '')),
    language_function VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (language_function IN ('intact', 'impaired', '')),
    known_dementia_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_dementia_diagnosis IN ('yes', 'no', '')),
    dementia_type VARCHAR(100) NOT NULL DEFAULT '',
    delirium_screen VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (delirium_screen IN ('positive', 'negative', '')),
    cognitive_decline_reported_by VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognitive_decline_reported_by IN ('patient', 'carer', 'both', 'none', '')),
    cognitive_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cognitive_screen_updated_at
    BEFORE UPDATE ON assessment_cognitive_screen
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cognitive_screen IS
    'Cognitive screening section: MMSE, MoCA, clock drawing, orientation, memory, and delirium screen. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cognitive_screen.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cognitive_screen.mmse_score IS
    'Mini-Mental State Examination score (0-30), NULL if not performed.';
COMMENT ON COLUMN assessment_cognitive_screen.moca_score IS
    'Montreal Cognitive Assessment score (0-30), NULL if not performed.';
COMMENT ON COLUMN assessment_cognitive_screen.clock_drawing_score IS
    'Clock drawing test score (0-6), NULL if not performed.';
COMMENT ON COLUMN assessment_cognitive_screen.orientation_to_time IS
    'Orientation to time: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.orientation_to_place IS
    'Orientation to place: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.short_term_memory IS
    'Short-term memory status: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.long_term_memory IS
    'Long-term memory status: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.executive_function IS
    'Executive function status: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.language_function IS
    'Language function status: intact, impaired, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.known_dementia_diagnosis IS
    'Whether there is a known dementia diagnosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.dementia_type IS
    'Type of dementia if diagnosed (e.g. Alzheimer, vascular, mixed).';
COMMENT ON COLUMN assessment_cognitive_screen.delirium_screen IS
    'Delirium screening result: positive, negative, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.cognitive_decline_reported_by IS
    'Who reported cognitive decline: patient, carer, both, none, or empty string.';
COMMENT ON COLUMN assessment_cognitive_screen.cognitive_notes IS
    'Free-text notes on cognitive assessment.';
