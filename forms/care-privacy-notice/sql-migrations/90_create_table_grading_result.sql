CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    completeness_status VARCHAR(20) NOT NULL DEFAULT 'incomplete'
        CHECK (completeness_status IN ('complete', 'incomplete')),
    sections_complete INTEGER NOT NULL DEFAULT 0
        CHECK (sections_complete >= 0 AND sections_complete <= 3),
    sections_total INTEGER NOT NULL DEFAULT 3
        CHECK (sections_total = 3),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed form completeness validation result. Complete means acknowledgment checkbox checked, name provided, and date provided. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.completeness_status IS
    'Overall form completeness: complete or incomplete.';
COMMENT ON COLUMN grading_result.sections_complete IS
    'Number of sections that pass completeness validation (0-3).';
COMMENT ON COLUMN grading_result.sections_total IS
    'Total number of sections requiring validation (always 3).';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the validation was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
