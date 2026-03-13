-- 08_assessment_performance_ratings.sql
-- COPM performance ratings section of the occupational therapy assessment.

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

CREATE TRIGGER trg_assessment_performance_ratings_updated_at
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

CREATE TRIGGER trg_assessment_performance_rating_item_updated_at
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
