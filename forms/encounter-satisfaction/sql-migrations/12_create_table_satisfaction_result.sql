CREATE TABLE satisfaction_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,
    -- Computed ESS composite score (mean of all answered Likert questions, range 1.0-5.0)
    composite_score             NUMERIC(3,2) NOT NULL
                                CHECK (composite_score >= 0 AND composite_score <= 5.0),
    -- Satisfaction category derived from composite score
    category                    TEXT NOT NULL DEFAULT ''
                                CHECK (category IN ('Excellent', 'Good', 'Fair', 'Poor', 'Very Poor', 'No responses', '')),
    -- Number of Likert questions answered (out of 19)
    answered_count              SMALLINT NOT NULL DEFAULT 0
                                CHECK (answered_count >= 0 AND answered_count <= 19),
    -- Denormalized per-domain scores for audit trail
    -- Keys: "Access & Scheduling",
    "Communication",
    "Staff & Professionalism",
    --        "Care Quality",
    "Environment",
    "Overall Satisfaction"
    domain_scores               JSONB NOT NULL DEFAULT '[]',
    -- Timestamp of when the ESS engine ran
    scored_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_satisfaction_result_updated_at
    BEFORE UPDATE ON satisfaction_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE satisfaction_result IS
    '1:1 with encounter_satisfaction. Computed ESS score with category and per-domain breakdown.';
COMMENT ON COLUMN satisfaction_result.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN satisfaction_result.composite_score IS
    'ESS composite score (1.0-5.0). Mean of all answered Likert questions. 0 if no responses.';
COMMENT ON COLUMN satisfaction_result.category IS
    'Satisfaction category: Excellent (4.5-5.0), Good (3.5-4.4), Fair (2.5-3.4), Poor (1.5-2.4), Very Poor (1.0-1.4), No responses.';
COMMENT ON COLUMN satisfaction_result.answered_count IS
    'Number of Likert questions answered out of 19 total.';
COMMENT ON COLUMN satisfaction_result.domain_scores IS
    'JSONB array of per-domain score objects. Each object has domain, mean, count, and questions array.';
COMMENT ON COLUMN satisfaction_result.scored_at IS
    'Timestamp when the ESS scoring engine produced this result.';
COMMENT ON COLUMN satisfaction_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN satisfaction_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN satisfaction_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN satisfaction_result.deleted_at IS
    'Timestamp when this row was deleted.';
