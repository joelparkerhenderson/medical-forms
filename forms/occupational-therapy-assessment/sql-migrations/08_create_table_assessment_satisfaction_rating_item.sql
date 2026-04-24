CREATE TABLE assessment_satisfaction_rating_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    satisfaction_ratings_id UUID NOT NULL
        REFERENCES assessment_satisfaction_ratings(id) ON DELETE CASCADE,
    occupational_issue VARCHAR(255) NOT NULL DEFAULT '',
    domain VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (domain IN ('self-care', 'productivity', 'leisure', '')),
    satisfaction_score INTEGER
        CHECK (satisfaction_score IS NULL OR (satisfaction_score >= 1 AND satisfaction_score <= 10)),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trigger_assessment_satisfaction_rating_item_updated_at
    BEFORE UPDATE ON assessment_satisfaction_rating_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_satisfaction_rating_item IS
    'Individual COPM satisfaction rating for a specific occupational issue identified by the patient.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.occupational_issue IS
    'Description of the specific occupational performance issue.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.domain IS
    'COPM domain: self-care, productivity, leisure, or empty.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.satisfaction_score IS
    'Patient-rated satisfaction score (1 = not satisfied, 10 = extremely satisfied).';
COMMENT ON COLUMN assessment_satisfaction_rating_item.sort_order IS
    'Display order of the item within the list.';

COMMENT ON COLUMN assessment_satisfaction_ratings.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_satisfaction_ratings.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_satisfaction_ratings.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.satisfaction_ratings_id IS
    'Foreign key to the assessment_satisfaction_ratings table.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN assessment_satisfaction_rating_item.deleted_at IS
    'Timestamp when this row was deleted.';
