CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    part_a_darkly_shaded_count INTEGER
        CHECK (part_a_darkly_shaded_count IS NULL OR (part_a_darkly_shaded_count >= 0 AND part_a_darkly_shaded_count <= 6)),
    screening_result VARCHAR(30) NOT NULL DEFAULT 'unlikely'
        CHECK (screening_result IN ('highly_consistent', 'unlikely', 'incomplete')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed ASRS v1.1 screening result. Part A: 4+ darkly shaded responses = highly consistent with ADHD diagnosis. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.part_a_darkly_shaded_count IS
    'Number of Part A responses falling in the darkly shaded (clinically significant) range (0-6). NULL if incomplete.';
COMMENT ON COLUMN grading_result.screening_result IS
    'ASRS screening outcome: highly_consistent (4+ shaded), unlikely (fewer than 4), or incomplete.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the ASRS grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
