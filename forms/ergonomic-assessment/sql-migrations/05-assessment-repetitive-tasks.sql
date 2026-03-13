-- ============================================================
-- 05_assessment_repetitive_tasks.sql
-- Repetitive task evaluation (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_repetitive_tasks (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    task_description        TEXT NOT NULL DEFAULT '',
    frequency               TEXT NOT NULL DEFAULT ''
                            CHECK (frequency IN ('rarely', 'occasionally', 'frequently', 'constantly', '')),
    duration_per_session    TEXT NOT NULL DEFAULT ''
                            CHECK (duration_per_session IN ('less-than-1hr', '1-2hrs', '2-4hrs', 'more-than-4hrs', '')),
    force_required          TEXT NOT NULL DEFAULT ''
                            CHECK (force_required IN ('none', 'light', 'moderate', 'heavy', '')),
    vibration_exposure      TEXT NOT NULL DEFAULT ''
                            CHECK (vibration_exposure IN ('yes', 'no', '')),
    cycle_time_seconds      INTEGER CHECK (cycle_time_seconds IS NULL OR (cycle_time_seconds >= 0 AND cycle_time_seconds <= 3600)),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_repetitive_tasks_updated_at
    BEFORE UPDATE ON assessment_repetitive_tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_repetitive_tasks IS
    'Repetitive task evaluation: description, frequency, duration, force, vibration, cycle time.';
COMMENT ON COLUMN assessment_repetitive_tasks.task_description IS
    'Free-text description of the main repetitive task(s).';
COMMENT ON COLUMN assessment_repetitive_tasks.frequency IS
    'How often the task is performed: rarely, occasionally, frequently, constantly, or empty.';
COMMENT ON COLUMN assessment_repetitive_tasks.duration_per_session IS
    'Duration per continuous session: less-than-1hr, 1-2hrs, 2-4hrs, more-than-4hrs, or empty.';
COMMENT ON COLUMN assessment_repetitive_tasks.force_required IS
    'Force level required: none, light, moderate, heavy, or empty.';
COMMENT ON COLUMN assessment_repetitive_tasks.vibration_exposure IS
    'Whether vibration exposure is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_repetitive_tasks.cycle_time_seconds IS
    'Time in seconds per repetition cycle. NULL if not measured.';
