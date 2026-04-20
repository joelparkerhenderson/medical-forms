-- 05_assessment_current_mood.sql
-- Current mood assessment section using PHQ-9.

CREATE TABLE assessment_current_mood (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    phq9_interest INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_interest >= 0 AND phq9_interest <= 3),
    phq9_feeling_down INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_feeling_down >= 0 AND phq9_feeling_down <= 3),
    phq9_sleep INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_sleep >= 0 AND phq9_sleep <= 3),
    phq9_tired INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_tired >= 0 AND phq9_tired <= 3),
    phq9_appetite INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_appetite >= 0 AND phq9_appetite <= 3),
    phq9_feeling_bad INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_feeling_bad >= 0 AND phq9_feeling_bad <= 3),
    phq9_concentration INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_concentration >= 0 AND phq9_concentration <= 3),
    phq9_moving_slowly INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_moving_slowly >= 0 AND phq9_moving_slowly <= 3),
    phq9_self_harm INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_self_harm >= 0 AND phq9_self_harm <= 3),
    phq9_total INTEGER NOT NULL DEFAULT 0
        CHECK (phq9_total >= 0 AND phq9_total <= 27),
    current_mood_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_mood_updated_at
    BEFORE UPDATE ON assessment_current_mood
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_mood IS
    'Current mood assessment section: PHQ-9 items (9 questions, each 0-3, total 0-27). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_mood.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_mood.phq9_interest IS
    'PHQ-9 Q1: Little interest or pleasure in doing things (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_feeling_down IS
    'PHQ-9 Q2: Feeling down, depressed, or hopeless (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_sleep IS
    'PHQ-9 Q3: Trouble falling or staying asleep, or sleeping too much (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_tired IS
    'PHQ-9 Q4: Feeling tired or having little energy (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_appetite IS
    'PHQ-9 Q5: Poor appetite or overeating (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_feeling_bad IS
    'PHQ-9 Q6: Feeling bad about yourself or that you are a failure (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_concentration IS
    'PHQ-9 Q7: Trouble concentrating on things (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_moving_slowly IS
    'PHQ-9 Q8: Moving or speaking slowly, or being fidgety/restless (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_self_harm IS
    'PHQ-9 Q9: Thoughts of being better off dead or hurting yourself (0=not at all, 3=nearly every day).';
COMMENT ON COLUMN assessment_current_mood.phq9_total IS
    'PHQ-9 total score (sum of 9 items, 0-27). 0-4 minimal, 5-9 mild, 10-14 moderate, 15-19 moderately severe, 20-27 severe.';
COMMENT ON COLUMN assessment_current_mood.current_mood_notes IS
    'Additional clinician notes on current mood assessment.';
