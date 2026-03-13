-- ============================================================
-- 08_environment.sql
-- Environment satisfaction domain (1:1 with encounter_satisfaction).
-- ============================================================
-- 3 Likert-scale questions (1-5) about facility environment.
-- ============================================================

CREATE TABLE environment (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,

    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied), NULL if unanswered
    cleanliness                 SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
    waiting_area_comfort        SMALLINT CHECK (waiting_area_comfort BETWEEN 1 AND 5),
    privacy                     SMALLINT CHECK (privacy BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_environment_updated_at
    BEFORE UPDATE ON environment
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE environment IS
    '1:1 with encounter_satisfaction. Environment domain: 3 Likert-scale satisfaction questions.';
COMMENT ON COLUMN environment.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN environment.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN environment.cleanliness IS
    'Satisfaction with facility cleanliness (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN environment.waiting_area_comfort IS
    'Satisfaction with waiting area comfort (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN environment.privacy IS
    'Satisfaction with privacy during visit (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN environment.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN environment.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
