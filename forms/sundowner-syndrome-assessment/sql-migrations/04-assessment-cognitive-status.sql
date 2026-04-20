-- 04_assessment_cognitive_status.sql
-- Cognitive status section of the sundowner syndrome assessment.

CREATE TABLE assessment_cognitive_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    dementia_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dementia_diagnosis IN ('yes', 'no', '')),
    dementia_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (dementia_type IN ('alzheimers', 'vascular', 'lewy-body', 'frontotemporal', 'mixed', 'unspecified', 'other', '')),
    dementia_stage VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (dementia_stage IN ('mild', 'moderate', 'severe', '')),
    mmse_score INTEGER
        CHECK (mmse_score IS NULL OR (mmse_score >= 0 AND mmse_score <= 30)),
    moca_score INTEGER
        CHECK (moca_score IS NULL OR (moca_score >= 0 AND moca_score <= 30)),
    orientation_impaired VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (orientation_impaired IN ('yes', 'no', '')),
    short_term_memory_impaired VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (short_term_memory_impaired IN ('yes', 'no', '')),
    long_term_memory_impaired VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (long_term_memory_impaired IN ('yes', 'no', '')),
    communication_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (communication_ability IN ('intact', 'mild-difficulty', 'moderate-difficulty', 'severe-difficulty', 'non-verbal', '')),
    decision_making_capacity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (decision_making_capacity IN ('full', 'partial', 'lacking', '')),
    cognitive_status_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cognitive_status_updated_at
    BEFORE UPDATE ON assessment_cognitive_status
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cognitive_status IS
    'Cognitive status section: dementia diagnosis, cognitive test scores, and functional cognition. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cognitive_status.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cognitive_status.dementia_diagnosis IS
    'Whether the patient has a formal dementia diagnosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.dementia_type IS
    'Type of dementia: alzheimers, vascular, lewy-body, frontotemporal, mixed, unspecified, other, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.dementia_stage IS
    'Stage of dementia: mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.mmse_score IS
    'Mini-Mental State Examination score (0-30).';
COMMENT ON COLUMN assessment_cognitive_status.moca_score IS
    'Montreal Cognitive Assessment score (0-30).';
COMMENT ON COLUMN assessment_cognitive_status.orientation_impaired IS
    'Whether orientation to time, place, and person is impaired: yes, no, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.short_term_memory_impaired IS
    'Whether short-term memory is impaired: yes, no, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.long_term_memory_impaired IS
    'Whether long-term memory is impaired: yes, no, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.communication_ability IS
    'Communication ability: intact, mild-difficulty, moderate-difficulty, severe-difficulty, non-verbal, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.decision_making_capacity IS
    'Mental capacity for decision-making: full, partial, lacking, or empty.';
COMMENT ON COLUMN assessment_cognitive_status.cognitive_status_notes IS
    'Additional clinician notes on cognitive status.';
