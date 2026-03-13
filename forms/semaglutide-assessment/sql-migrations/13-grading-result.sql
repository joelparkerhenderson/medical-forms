-- 13_grading_result.sql
-- Stores the computed eligibility grading result for a semaglutide assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    eligibility_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (eligibility_status IN ('eligible', 'conditional', 'ineligible', '')),
    absolute_contraindication_count INTEGER NOT NULL DEFAULT 0
        CHECK (absolute_contraindication_count >= 0),
    relative_contraindication_count INTEGER NOT NULL DEFAULT 0
        CHECK (relative_contraindication_count >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed semaglutide eligibility grading result. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.eligibility_status IS
    'Eligibility classification: eligible, conditional, ineligible, or empty string if not yet graded.';
COMMENT ON COLUMN grading_result.absolute_contraindication_count IS
    'Number of absolute contraindications identified.';
COMMENT ON COLUMN grading_result.relative_contraindication_count IS
    'Number of relative contraindications identified.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
