-- 13_grading_result.sql
-- Stores the computed validity grading result for an advance decision to refuse treatment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    validity_level VARCHAR(12) NOT NULL DEFAULT 'incomplete'
        CHECK (validity_level IN ('valid', 'invalid', 'incomplete')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed validity grading result for the advance decision to refuse treatment. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.validity_level IS
    'Overall validity classification: valid, invalid, or incomplete per Mental Capacity Act 2005 requirements.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the validity grading was computed.';
