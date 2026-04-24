CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    das28_score NUMERIC(4,2)
        CHECK (das28_score IS NULL OR das28_score >= 0),
    das28_method VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (das28_method IN ('das28_esr', 'das28_crp', '')),
    disease_activity_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (disease_activity_level IN ('remission', 'low', 'moderate', 'high', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed DAS28 disease activity grading result. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.das28_score IS
    'DAS28 continuous score; <2.6 remission, 2.6-3.2 low, 3.2-5.1 moderate, >5.1 high.';
COMMENT ON COLUMN grading_result.das28_method IS
    'DAS28 calculation method used: das28_esr or das28_crp.';
COMMENT ON COLUMN grading_result.disease_activity_level IS
    'Disease activity category: remission, low, moderate, high, or empty string if not yet graded.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
