-- 09_assessment_working_memory_processing_speed.sql
-- Working memory and processing speed section of the dyslexia assessment.

CREATE TABLE assessment_working_memory_processing_speed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    working_memory_score INTEGER
        CHECK (working_memory_score IS NULL OR (working_memory_score >= 40 AND working_memory_score <= 160)),
    processing_speed_score INTEGER
        CHECK (processing_speed_score IS NULL OR (processing_speed_score >= 40 AND processing_speed_score <= 160)),
    digit_span_forward INTEGER
        CHECK (digit_span_forward IS NULL OR (digit_span_forward >= 0 AND digit_span_forward <= 20)),
    digit_span_backward INTEGER
        CHECK (digit_span_backward IS NULL OR (digit_span_backward >= 0 AND digit_span_backward <= 20)),
    following_instructions VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (following_instructions IN ('age-appropriate', 'below-age', 'significantly-below', '')),
    task_completion_speed VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (task_completion_speed IN ('above-average', 'average', 'below-average', 'significantly-below', '')),
    organisational_skills VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (organisational_skills IN ('good', 'adequate', 'poor', 'very-poor', '')),
    concentration_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (concentration_difficulties IN ('yes', 'no', '')),
    concentration_details TEXT NOT NULL DEFAULT '',
    working_memory_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_working_memory_processing_speed_updated_at
    BEFORE UPDATE ON assessment_working_memory_processing_speed
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_working_memory_processing_speed IS
    'Working memory and processing speed section: standardised scores, digit span, functional observations. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_working_memory_processing_speed.working_memory_score IS
    'Standardised score for working memory (mean 100, SD 15).';
COMMENT ON COLUMN assessment_working_memory_processing_speed.processing_speed_score IS
    'Standardised score for processing speed (mean 100, SD 15).';
COMMENT ON COLUMN assessment_working_memory_processing_speed.digit_span_forward IS
    'Maximum digit span forward.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.digit_span_backward IS
    'Maximum digit span backward.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.following_instructions IS
    'Ability to follow multi-step instructions: age-appropriate, below-age, significantly-below, or empty.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.task_completion_speed IS
    'Speed of task completion: above-average, average, below-average, significantly-below, or empty.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.organisational_skills IS
    'Organisational skills: good, adequate, poor, very-poor, or empty.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.concentration_difficulties IS
    'Whether the patient has concentration difficulties: yes, no, or empty.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.concentration_details IS
    'Details of concentration difficulties.';
COMMENT ON COLUMN assessment_working_memory_processing_speed.working_memory_notes IS
    'Additional clinician notes on working memory and processing speed.';
