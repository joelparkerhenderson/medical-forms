-- 09-assessment-neurological.sql
-- Step 7: neurological and cognitive examination.

CREATE TABLE assessment_neurological (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gcs_total INTEGER CHECK (gcs_total IS NULL OR gcs_total BETWEEN 3 AND 15),
    gcs_eye INTEGER CHECK (gcs_eye IS NULL OR gcs_eye BETWEEN 1 AND 4),
    gcs_verbal INTEGER CHECK (gcs_verbal IS NULL OR gcs_verbal BETWEEN 1 AND 5),
    gcs_motor INTEGER CHECK (gcs_motor IS NULL OR gcs_motor BETWEEN 1 AND 6),

    cognition_tool VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognition_tool IN ('AMT-4', 'MOCA', 'MMSE', 'none', '')),
    cognition_score INTEGER,
    cognitive_impairment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cognitive_impairment IN ('none', 'mild', 'moderate', 'severe', '')),
    capacity_concern VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (capacity_concern IN ('yes', 'no', '')),

    cranial_nerves_notes TEXT NOT NULL DEFAULT '',
    motor_power VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (motor_power IN ('normal', 'reduced', 'severely-reduced', '')),
    sensory_notes TEXT NOT NULL DEFAULT '',
    reflexes VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reflexes IN ('normal', 'hyperreflexic', 'hyporeflexic', 'absent', '')),

    recent_stroke_tia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_stroke_tia IN ('yes', 'no', '')),
    days_since_stroke_tia INTEGER,
    seizure_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (seizure_disorder IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_neurological_updated_at
    BEFORE UPDATE ON assessment_neurological
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_neurological IS
    'Step 7: neurological examination including GCS, cognitive screening, motor/sensory/reflex findings, and recent cerebrovascular events.';
COMMENT ON COLUMN assessment_neurological.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_neurological.gcs_total IS
    'Glasgow Coma Scale total (3-15).';
COMMENT ON COLUMN assessment_neurological.gcs_eye IS
    'GCS eye-opening component (1-4).';
COMMENT ON COLUMN assessment_neurological.gcs_verbal IS
    'GCS verbal component (1-5).';
COMMENT ON COLUMN assessment_neurological.gcs_motor IS
    'GCS motor component (1-6).';
COMMENT ON COLUMN assessment_neurological.cognition_tool IS
    'Cognitive assessment tool used: AMT-4, MOCA, MMSE, or none.';
COMMENT ON COLUMN assessment_neurological.cognition_score IS
    'Score on the selected cognitive tool.';
COMMENT ON COLUMN assessment_neurological.cognitive_impairment IS
    'Clinician summary of cognitive impairment: none, mild, moderate, severe.';
COMMENT ON COLUMN assessment_neurological.capacity_concern IS
    'Clinician concern about mental capacity for consent.';
COMMENT ON COLUMN assessment_neurological.cranial_nerves_notes IS
    'Free-text cranial nerve examination notes.';
COMMENT ON COLUMN assessment_neurological.motor_power IS
    'Overall motor power: normal, reduced, severely-reduced.';
COMMENT ON COLUMN assessment_neurological.sensory_notes IS
    'Free-text sensory examination notes.';
COMMENT ON COLUMN assessment_neurological.reflexes IS
    'Deep tendon reflexes: normal, hyperreflexic, hyporeflexic, absent.';
COMMENT ON COLUMN assessment_neurological.recent_stroke_tia IS
    'Stroke or TIA within the last 3 months.';
COMMENT ON COLUMN assessment_neurological.days_since_stroke_tia IS
    'Days since last stroke or TIA event.';
COMMENT ON COLUMN assessment_neurological.seizure_disorder IS
    'Known seizure disorder.';
