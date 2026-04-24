CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    eligibility VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (eligibility IN ('suitable', 'conditionally-suitable', 'unsuitable', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    hla_match_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hla_match_level IN ('10-of-10', '9-of-10', '8-of-10', '7-of-10', 'haploidentical', '')),
    collection_method VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (collection_method IN ('pbsc', 'bone-marrow', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed donor eligibility grading result. Eligibility (suitable/conditionally-suitable/unsuitable), risk level, HLA match, collection method. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.eligibility IS
    'Donor eligibility decision: suitable, conditionally-suitable, unsuitable, or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall donor risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.hla_match_level IS
    'HLA match level: 10-of-10, 9-of-10, 8-of-10, 7-of-10, haploidentical, or empty.';
COMMENT ON COLUMN grading_result.collection_method IS
    'Final collection method: pbsc, bone-marrow, or empty.';
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
