CREATE TABLE overall_satisfaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,
    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied),
    NULL if unanswered
    overall_rating              SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
    likely_to_recommend         SMALLINT CHECK (likely_to_recommend BETWEEN 1 AND 5),
    likely_to_return            SMALLINT CHECK (likely_to_return BETWEEN 1 AND 5),
    -- Free-text comments
    comments                    TEXT NOT NULL DEFAULT ''
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_overall_satisfaction_updated_at
    BEFORE UPDATE ON overall_satisfaction
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE overall_satisfaction IS
    '1:1 with encounter_satisfaction. Overall Satisfaction domain: 3 Likert-scale questions plus free-text comments.';
COMMENT ON COLUMN overall_satisfaction.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN overall_satisfaction.overall_rating IS
    'Overall satisfaction rating (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN overall_satisfaction.likely_to_recommend IS
    'Likelihood of recommending the provider (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN overall_satisfaction.likely_to_return IS
    'Likelihood of returning for future care (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN overall_satisfaction.comments IS
    'Free-text additional comments from the patient.';
COMMENT ON COLUMN overall_satisfaction.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN overall_satisfaction.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN overall_satisfaction.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN overall_satisfaction.deleted_at IS
    'Timestamp when this row was deleted.';
