-- ============================================================
-- 04_access_scheduling.sql
-- Access & Scheduling satisfaction domain (1:1 with encounter_satisfaction).
-- ============================================================
-- 3 Likert-scale questions (1-5) about scheduling ease and wait times.
-- ============================================================

CREATE TABLE access_scheduling (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,

    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied), NULL if unanswered
    ease_of_scheduling          SMALLINT CHECK (ease_of_scheduling BETWEEN 1 AND 5),
    wait_for_appointment        SMALLINT CHECK (wait_for_appointment BETWEEN 1 AND 5),
    wait_in_waiting_room        SMALLINT CHECK (wait_in_waiting_room BETWEEN 1 AND 5),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_access_scheduling_updated_at
    BEFORE UPDATE ON access_scheduling
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE access_scheduling IS
    '1:1 with encounter_satisfaction. Access & Scheduling domain: 3 Likert-scale satisfaction questions.';
COMMENT ON COLUMN access_scheduling.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN access_scheduling.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN access_scheduling.ease_of_scheduling IS
    'Satisfaction with ease of scheduling (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN access_scheduling.wait_for_appointment IS
    'Satisfaction with wait time for appointment (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN access_scheduling.wait_in_waiting_room IS
    'Satisfaction with wait time in waiting room (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN access_scheduling.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN access_scheduling.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
