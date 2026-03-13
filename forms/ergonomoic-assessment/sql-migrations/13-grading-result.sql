-- 13_grading_result.sql
-- Stores the computed REBA grading result for an ergonomic assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reba_score INTEGER NOT NULL DEFAULT 1
        CHECK (reba_score >= 1 AND reba_score <= 15),
    risk_level VARCHAR(15) NOT NULL DEFAULT 'negligible'
        CHECK (risk_level IN ('negligible', 'low', 'medium', 'high', 'very_high')),
    action_level VARCHAR(30) NOT NULL DEFAULT 'none'
        CHECK (action_level IN ('none', 'may_be_needed', 'necessary_soon', 'necessary_now', 'immediate')),
    group_a_score INTEGER
        CHECK (group_a_score IS NULL OR group_a_score BETWEEN 1 AND 9),
    group_b_score INTEGER
        CHECK (group_b_score IS NULL OR group_b_score BETWEEN 1 AND 9),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed REBA grading result for ergonomic assessment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.reba_score IS
    'REBA final score (1-15).';
COMMENT ON COLUMN grading_result.risk_level IS
    'REBA risk level: negligible (1), low (2-3), medium (4-7), high (8-10), very_high (11-15).';
COMMENT ON COLUMN grading_result.action_level IS
    'REBA action level: none, may_be_needed, necessary_soon, necessary_now, immediate.';
COMMENT ON COLUMN grading_result.group_a_score IS
    'REBA Group A score (trunk, neck, legs).';
COMMENT ON COLUMN grading_result.group_b_score IS
    'REBA Group B score (upper arms, lower arms, wrists).';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
