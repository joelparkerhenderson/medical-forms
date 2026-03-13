-- ============================================================
-- 06_staff_professionalism.sql
-- Staff & Professionalism satisfaction domain (1:1 with encounter_satisfaction).
-- ============================================================
-- 3 Likert-scale questions (1-5) about staff courtesy and respect.
-- ============================================================

CREATE TABLE staff_professionalism (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,

    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied), NULL if unanswered
    reception_courtesy          SMALLINT CHECK (reception_courtesy BETWEEN 1 AND 5),
    nursing_courtesy            SMALLINT CHECK (nursing_courtesy BETWEEN 1 AND 5),
    respect_shown               SMALLINT CHECK (respect_shown BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_staff_professionalism_updated_at
    BEFORE UPDATE ON staff_professionalism
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE staff_professionalism IS
    '1:1 with encounter_satisfaction. Staff & Professionalism domain: 3 Likert-scale satisfaction questions.';
COMMENT ON COLUMN staff_professionalism.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN staff_professionalism.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN staff_professionalism.reception_courtesy IS
    'Satisfaction with reception staff courtesy (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN staff_professionalism.nursing_courtesy IS
    'Satisfaction with nursing staff courtesy (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN staff_professionalism.respect_shown IS
    'Satisfaction with respect shown during visit (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN staff_professionalism.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN staff_professionalism.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
