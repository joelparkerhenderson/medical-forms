CREATE TABLE assessment_performance_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_performance_score NUMERIC(3,1)
        CHECK (overall_performance_score IS NULL OR (overall_performance_score >= 1.0 AND overall_performance_score <= 10.0)),
    self_care_performance_score NUMERIC(3,1)
        CHECK (self_care_performance_score IS NULL OR (self_care_performance_score >= 1.0 AND self_care_performance_score <= 10.0)),
    productivity_performance_score NUMERIC(3,1)
        CHECK (productivity_performance_score IS NULL OR (productivity_performance_score >= 1.0 AND productivity_performance_score <= 10.0)),
    leisure_performance_score NUMERIC(3,1)
        CHECK (leisure_performance_score IS NULL OR (leisure_performance_score >= 1.0 AND leisure_performance_score <= 10.0)),
    performance_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_assessment_performance_ratings_updated_at
    BEFORE UPDATE ON assessment_performance_ratings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_performance_ratings IS
    'COPM performance ratings section: patient-rated performance scores (1-10) across occupational domains. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_performance_ratings.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_performance_ratings.overall_performance_score IS
    'Overall COPM performance score (1-10), averaged across domains.';
COMMENT ON COLUMN assessment_performance_ratings.self_care_performance_score IS
    'COPM performance score for self-care activities (1 = not able, 10 = able to do extremely well).';
COMMENT ON COLUMN assessment_performance_ratings.productivity_performance_score IS
    'COPM performance score for productivity activities (1 = not able, 10 = able to do extremely well).';
COMMENT ON COLUMN assessment_performance_ratings.leisure_performance_score IS
    'COPM performance score for leisure activities (1 = not able, 10 = able to do extremely well).';
COMMENT ON COLUMN assessment_performance_ratings.performance_notes IS
    'Additional notes on performance ratings and observations.';

-- Individual performance rating items for specific occupational issues (one-to-many child)

COMMENT ON COLUMN assessment_performance_ratings.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment_performance_ratings.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN assessment_performance_ratings.updated_at IS
    'Timestamp when this row was last updated.';
