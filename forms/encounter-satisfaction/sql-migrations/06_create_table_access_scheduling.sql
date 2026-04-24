CREATE TABLE access_scheduling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with encounter_satisfaction
    encounter_satisfaction_id   UUID NOT NULL UNIQUE REFERENCES encounter_satisfaction(id) ON DELETE CASCADE,
    -- Likert scores (1=Very Dissatisfied ... 5=Very Satisfied),
    NULL if unanswered
    ease_of_scheduling          SMALLINT CHECK (ease_of_scheduling BETWEEN 1 AND 5),
    wait_for_appointment        SMALLINT CHECK (wait_for_appointment BETWEEN 1 AND 5),
    wait_in_waiting_room        SMALLINT CHECK (wait_in_waiting_room BETWEEN 1 AND 5)
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_access_scheduling_updated_at
    BEFORE UPDATE ON access_scheduling
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE access_scheduling IS
    '1:1 with encounter_satisfaction. Access & Scheduling domain: 3 Likert-scale satisfaction questions.';
COMMENT ON COLUMN access_scheduling.encounter_satisfaction_id IS
    'FK to encounter_satisfaction (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN access_scheduling.ease_of_scheduling IS
    'Satisfaction with ease of scheduling (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN access_scheduling.wait_for_appointment IS
    'Satisfaction with wait time for appointment (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN access_scheduling.wait_in_waiting_room IS
    'Satisfaction with wait time in waiting room (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN access_scheduling.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN access_scheduling.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN access_scheduling.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN access_scheduling.deleted_at IS
    'Timestamp when this row was deleted.';
