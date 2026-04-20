-- 05_assessment_access_waiting_times.sql
-- Access and waiting times section of the patient satisfaction survey.

CREATE TABLE assessment_access_waiting_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ease_of_booking INTEGER
        CHECK (ease_of_booking IS NULL OR (ease_of_booking >= 1 AND ease_of_booking <= 5)),
    waiting_time_for_appointment INTEGER
        CHECK (waiting_time_for_appointment IS NULL OR (waiting_time_for_appointment >= 1 AND waiting_time_for_appointment <= 5)),
    waiting_time_on_day INTEGER
        CHECK (waiting_time_on_day IS NULL OR (waiting_time_on_day >= 1 AND waiting_time_on_day <= 5)),
    reception_service INTEGER
        CHECK (reception_service IS NULL OR (reception_service >= 1 AND reception_service <= 5)),
    signage_wayfinding INTEGER
        CHECK (signage_wayfinding IS NULL OR (signage_wayfinding >= 1 AND signage_wayfinding <= 5)),
    parking_transport INTEGER
        CHECK (parking_transport IS NULL OR (parking_transport >= 1 AND parking_transport <= 5)),
    actual_wait_minutes INTEGER
        CHECK (actual_wait_minutes IS NULL OR actual_wait_minutes >= 0),
    access_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_access_waiting_times_updated_at
    BEFORE UPDATE ON assessment_access_waiting_times
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_access_waiting_times IS
    'Access and waiting times section: booking ease, wait times, reception quality, and transport. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_access_waiting_times.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_access_waiting_times.ease_of_booking IS
    'Satisfaction with booking process (1=Very Dissatisfied, 5=Very Satisfied).';
COMMENT ON COLUMN assessment_access_waiting_times.waiting_time_for_appointment IS
    'Satisfaction with time waited to get appointment (1-5 Likert).';
COMMENT ON COLUMN assessment_access_waiting_times.waiting_time_on_day IS
    'Satisfaction with waiting time on the day of visit (1-5 Likert).';
COMMENT ON COLUMN assessment_access_waiting_times.reception_service IS
    'Satisfaction with reception and check-in service (1-5 Likert).';
COMMENT ON COLUMN assessment_access_waiting_times.signage_wayfinding IS
    'Satisfaction with signage and wayfinding (1-5 Likert).';
COMMENT ON COLUMN assessment_access_waiting_times.parking_transport IS
    'Satisfaction with parking and transport access (1-5 Likert).';
COMMENT ON COLUMN assessment_access_waiting_times.actual_wait_minutes IS
    'Actual waiting time in minutes on the day.';
COMMENT ON COLUMN assessment_access_waiting_times.access_notes IS
    'Additional notes about access and waiting times.';
