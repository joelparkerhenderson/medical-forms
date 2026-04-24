CREATE TABLE news2_result (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with casualty_card
    casualty_card_id        UUID NOT NULL UNIQUE REFERENCES casualty_card(id) ON DELETE CASCADE,

    -- Computed NEWS2 total score (sum of 7 parameter scores, range 0-20)
    total_score             INTEGER NOT NULL
                            CHECK (total_score >= 0 AND total_score <= 20),

    -- Clinical response threshold derived from total score
    clinical_response       TEXT NOT NULL DEFAULT ''
                            CHECK (clinical_response IN ('low', 'low-medium', 'medium', 'high', '')),

    -- Whether any single parameter scored 3 (triggers urgent ward review)
    has_any_single_score_3  BOOLEAN NOT NULL DEFAULT FALSE,

    -- Denormalized individual parameter scores for audit trail
    -- Keys: respiratory_rate, oxygen_saturation, systolic_bp, pulse,
    --        consciousness, temperature, supplemental_oxygen
    parameter_scores        JSONB NOT NULL DEFAULT '{}',

    -- Timestamp of when the NEWS2 engine ran
    scored_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_news2_result_updated_at
    BEFORE UPDATE ON news2_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE news2_result IS
    '1:1 with casualty_card. Computed NEWS2 score with clinical response threshold and parameter breakdown.';
COMMENT ON COLUMN news2_result.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN news2_result.casualty_card_id IS
    'FK to casualty_card (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN news2_result.total_score IS
    'NEWS2 aggregate score (0-20). Sum of 7 parameter scores.';
COMMENT ON COLUMN news2_result.clinical_response IS
    'Clinical response threshold: low (0-4), low-medium (single param 3), medium (5-6), high (>=7), or empty string if unanswered.';
COMMENT ON COLUMN news2_result.has_any_single_score_3 IS
    'TRUE if any single NEWS2 parameter scored 3. Triggers urgent ward review regardless of total.';
COMMENT ON COLUMN news2_result.parameter_scores IS
    'JSONB object with individual parameter scores. Keys: respiratory_rate, oxygen_saturation, systolic_bp, pulse, consciousness, temperature, supplemental_oxygen.';
COMMENT ON COLUMN news2_result.scored_at IS
    'Timestamp when the NEWS2 scoring engine produced this result.';
COMMENT ON COLUMN news2_result.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN news2_result.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
