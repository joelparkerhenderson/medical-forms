-- 05_assessment_pain_assessment.sql
-- Pain assessment section of the orthopedic assessment.

CREATE TABLE assessment_pain_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pain_at_rest INTEGER
        CHECK (pain_at_rest IS NULL OR (pain_at_rest >= 0 AND pain_at_rest <= 10)),
    pain_with_activity INTEGER
        CHECK (pain_with_activity IS NULL OR (pain_with_activity >= 0 AND pain_with_activity <= 10)),
    pain_at_night INTEGER
        CHECK (pain_at_night IS NULL OR (pain_at_night >= 0 AND pain_at_night <= 10)),
    worst_pain INTEGER
        CHECK (worst_pain IS NULL OR (worst_pain >= 0 AND worst_pain <= 10)),
    pain_character VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (pain_character IN ('sharp', 'dull', 'aching', 'burning', 'throbbing', 'stabbing', 'shooting', 'cramping', '')),
    pain_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pain_pattern IN ('constant', 'intermittent', 'episodic', '')),
    pain_location TEXT NOT NULL DEFAULT '',
    pain_radiation TEXT NOT NULL DEFAULT '',
    night_waking VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (night_waking IN ('yes', 'no', '')),
    morning_stiffness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (morning_stiffness IN ('yes', 'no', '')),
    morning_stiffness_duration_minutes INTEGER
        CHECK (morning_stiffness_duration_minutes IS NULL OR morning_stiffness_duration_minutes >= 0),
    current_analgesia TEXT NOT NULL DEFAULT '',
    analgesia_effectiveness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (analgesia_effectiveness IN ('effective', 'partially-effective', 'ineffective', '')),
    pain_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_pain_assessment_updated_at
    BEFORE UPDATE ON assessment_pain_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_pain_assessment IS
    'Pain assessment section: pain levels at rest, with activity, at night, character, pattern, and current analgesia. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_pain_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_pain_assessment.pain_at_rest IS
    'Pain level at rest on 0-10 NRS (0 = no pain, 10 = worst pain).';
COMMENT ON COLUMN assessment_pain_assessment.pain_with_activity IS
    'Pain level during activity on 0-10 NRS.';
COMMENT ON COLUMN assessment_pain_assessment.pain_at_night IS
    'Pain level at night on 0-10 NRS.';
COMMENT ON COLUMN assessment_pain_assessment.worst_pain IS
    'Worst pain level experienced on 0-10 NRS.';
COMMENT ON COLUMN assessment_pain_assessment.pain_character IS
    'Character of pain: sharp, dull, aching, burning, throbbing, stabbing, shooting, cramping, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pain_pattern IS
    'Pain pattern: constant, intermittent, episodic, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pain_location IS
    'Description of primary pain location.';
COMMENT ON COLUMN assessment_pain_assessment.pain_radiation IS
    'Description of pain radiation pattern if present.';
COMMENT ON COLUMN assessment_pain_assessment.night_waking IS
    'Whether pain wakes the patient at night: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.morning_stiffness IS
    'Whether morning stiffness is present: yes, no, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.morning_stiffness_duration_minutes IS
    'Duration of morning stiffness in minutes.';
COMMENT ON COLUMN assessment_pain_assessment.current_analgesia IS
    'Current pain medications and doses.';
COMMENT ON COLUMN assessment_pain_assessment.analgesia_effectiveness IS
    'Effectiveness of current analgesia: effective, partially-effective, ineffective, or empty.';
COMMENT ON COLUMN assessment_pain_assessment.pain_notes IS
    'Additional clinician notes on pain assessment.';
