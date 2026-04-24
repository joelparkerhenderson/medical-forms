CREATE TABLE assessment_performance_rating_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    performance_ratings_id UUID NOT NULL
        REFERENCES assessment_performance_ratings(id) ON DELETE CASCADE,

    occupational_issue VARCHAR(255) NOT NULL DEFAULT '',
    domain VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (domain IN ('self-care', 'productivity', 'leisure', '')),
    importance_score INTEGER
        CHECK (importance_score IS NULL OR (importance_score >= 1 AND importance_score <= 10)),
    performance_score INTEGER
        CHECK (performance_score IS NULL OR (performance_score >= 1 AND performance_score <= 10)),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_performance_rating_item_updated_at
    BEFORE UPDATE ON assessment_performance_rating_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_performance_rating_item IS
    'Individual COPM performance rating for a specific occupational issue identified by the patient.';
COMMENT ON COLUMN assessment_performance_rating_item.occupational_issue IS
    'Description of the specific occupational performance issue.';
COMMENT ON COLUMN assessment_performance_rating_item.domain IS
    'COPM domain: self-care, productivity, leisure, or empty.';
COMMENT ON COLUMN assessment_performance_rating_item.importance_score IS
    'Patient-rated importance of this issue (1 = not important, 10 = extremely important).';
COMMENT ON COLUMN assessment_performance_rating_item.performance_score IS
    'Patient-rated performance score (1 = not able, 10 = able to do extremely well).';
COMMENT ON COLUMN assessment_performance_rating_item.sort_order IS
    'Display order of the item within the list.';

COMMENT ON COLUMN assessment_performance_ratings.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_performance_ratings.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_performance_ratings.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN assessment_performance_rating_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_performance_rating_item.performance_ratings_id IS
    'Foreign key to the assessment_performance_ratings table.';
COMMENT ON COLUMN assessment_performance_rating_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_performance_rating_item.updated_at IS
    'Timestamp when this row was last updated.';
