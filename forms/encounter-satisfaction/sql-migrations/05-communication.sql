-- ============================================================
-- 05_communication.sql
-- Communication satisfaction domain (1:1 with encounter_satisfaction).
-- ============================================================
-- 4 Likert-scale questions (1-5) about provider communication.
-- ============================================================

CREATE TABLE communication (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,

    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied), NULL if unanswered
    listening                   SMALLINT CHECK (listening BETWEEN 1 AND 5),
    explaining_condition        SMALLINT CHECK (explaining_condition BETWEEN 1 AND 5),
    answering_questions         SMALLINT CHECK (answering_questions BETWEEN 1 AND 5),
    time_spent                  SMALLINT CHECK (time_spent BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_communication_updated_at
    BEFORE UPDATE ON communication
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE communication IS
    '1:1 with encounter_satisfaction. Communication domain: 4 Likert-scale satisfaction questions.';
COMMENT ON COLUMN communication.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN communication.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN communication.listening IS
    'Satisfaction with how well the provider listened (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN communication.explaining_condition IS
    'Satisfaction with how clearly the condition was explained (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN communication.answering_questions IS
    'Satisfaction with how thoroughly questions were answered (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN communication.time_spent IS
    'Satisfaction with time the provider spent with patient (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN communication.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN communication.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
