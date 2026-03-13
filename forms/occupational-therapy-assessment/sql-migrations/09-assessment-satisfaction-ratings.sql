-- 09_assessment_satisfaction_ratings.sql
-- COPM satisfaction ratings section of the occupational therapy assessment.

CREATE TABLE assessment_satisfaction_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    overall_satisfaction_score NUMERIC(3,1)
        CHECK (overall_satisfaction_score IS NULL OR (overall_satisfaction_score >= 1.0 AND overall_satisfaction_score <= 10.0)),
    self_care_satisfaction_score NUMERIC(3,1)
        CHECK (self_care_satisfaction_score IS NULL OR (self_care_satisfaction_score >= 1.0 AND self_care_satisfaction_score <= 10.0)),
    productivity_satisfaction_score NUMERIC(3,1)
        CHECK (productivity_satisfaction_score IS NULL OR (productivity_satisfaction_score >= 1.0 AND productivity_satisfaction_score <= 10.0)),
    leisure_satisfaction_score NUMERIC(3,1)
        CHECK (leisure_satisfaction_score IS NULL OR (leisure_satisfaction_score >= 1.0 AND leisure_satisfaction_score <= 10.0)),
    satisfaction_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_satisfaction_ratings_updated_at
    BEFORE UPDATE ON assessment_satisfaction_ratings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_satisfaction_ratings IS
    'COPM satisfaction ratings section: patient-rated satisfaction scores (1-10) across occupational domains. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_satisfaction_ratings.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_satisfaction_ratings.overall_satisfaction_score IS
    'Overall COPM satisfaction score (1-10), averaged across domains.';
COMMENT ON COLUMN assessment_satisfaction_ratings.self_care_satisfaction_score IS
    'COPM satisfaction score for self-care activities (1 = not satisfied, 10 = extremely satisfied).';
COMMENT ON COLUMN assessment_satisfaction_ratings.productivity_satisfaction_score IS
    'COPM satisfaction score for productivity activities (1 = not satisfied, 10 = extremely satisfied).';
COMMENT ON COLUMN assessment_satisfaction_ratings.leisure_satisfaction_score IS
    'COPM satisfaction score for leisure activities (1 = not satisfied, 10 = extremely satisfied).';
COMMENT ON COLUMN assessment_satisfaction_ratings.satisfaction_notes IS
    'Additional notes on satisfaction ratings and observations.';

-- Individual satisfaction rating items for specific occupational issues (one-to-many child)
CREATE TABLE assessment_satisfaction_rating_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    satisfaction_ratings_id UUID NOT NULL
        REFERENCES assessment_satisfaction_ratings(id) ON DELETE CASCADE,

    occupational_issue VARCHAR(255) NOT NULL DEFAULT '',
    domain VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (domain IN ('self-care', 'productivity', 'leisure', '')),
    satisfaction_score INTEGER
        CHECK (satisfaction_score IS NULL OR (satisfaction_score >= 1 AND satisfaction_score <= 10)),
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_satisfaction_rating_item_updated_at
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
