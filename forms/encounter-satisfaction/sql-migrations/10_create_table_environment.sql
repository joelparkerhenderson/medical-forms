CREATE TABLE environment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,
    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied),
    NULL if unanswered
    cleanliness                 SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
    waiting_area_comfort        SMALLINT CHECK (waiting_area_comfort BETWEEN 1 AND 5),
    privacy                     SMALLINT CHECK (privacy BETWEEN 1 AND 5)
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_environment_updated_at
    BEFORE UPDATE ON environment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE environment IS
    '1:1 with encounter_satisfaction. Environment domain: 3 Likert-scale satisfaction questions.';
COMMENT ON COLUMN environment.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN environment.cleanliness IS
    'Satisfaction with facility cleanliness (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN environment.waiting_area_comfort IS
    'Satisfaction with waiting area comfort (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN environment.privacy IS
    'Satisfaction with privacy during visit (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN environment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN environment.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN environment.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN environment.deleted_at IS
    'Timestamp when this row was deleted.';
