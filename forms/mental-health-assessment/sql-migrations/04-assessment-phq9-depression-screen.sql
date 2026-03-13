-- 04_assessment_phq9_depression_screen.sql
-- PHQ-9 Depression Screen section of the mental health assessment.

CREATE TABLE assessment_phq9_depression_screen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- PHQ-9 items: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day
    q1_little_interest INTEGER
        CHECK (q1_little_interest IS NULL OR (q1_little_interest >= 0 AND q1_little_interest <= 3)),
    q2_feeling_down INTEGER
        CHECK (q2_feeling_down IS NULL OR (q2_feeling_down >= 0 AND q2_feeling_down <= 3)),
    q3_sleep_problems INTEGER
        CHECK (q3_sleep_problems IS NULL OR (q3_sleep_problems >= 0 AND q3_sleep_problems <= 3)),
    q4_feeling_tired INTEGER
        CHECK (q4_feeling_tired IS NULL OR (q4_feeling_tired >= 0 AND q4_feeling_tired <= 3)),
    q5_appetite_changes INTEGER
        CHECK (q5_appetite_changes IS NULL OR (q5_appetite_changes >= 0 AND q5_appetite_changes <= 3)),
    q6_feeling_bad_about_self INTEGER
        CHECK (q6_feeling_bad_about_self IS NULL OR (q6_feeling_bad_about_self >= 0 AND q6_feeling_bad_about_self <= 3)),
    q7_trouble_concentrating INTEGER
        CHECK (q7_trouble_concentrating IS NULL OR (q7_trouble_concentrating >= 0 AND q7_trouble_concentrating <= 3)),
    q8_moving_slowly_or_fidgety INTEGER
        CHECK (q8_moving_slowly_or_fidgety IS NULL OR (q8_moving_slowly_or_fidgety >= 0 AND q8_moving_slowly_or_fidgety <= 3)),
    q9_thoughts_of_self_harm INTEGER
        CHECK (q9_thoughts_of_self_harm IS NULL OR (q9_thoughts_of_self_harm >= 0 AND q9_thoughts_of_self_harm <= 3)),
    phq9_total_score INTEGER
        CHECK (phq9_total_score IS NULL OR (phq9_total_score >= 0 AND phq9_total_score <= 27)),
    difficulty_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (difficulty_level IN ('not-difficult', 'somewhat-difficult', 'very-difficult', 'extremely-difficult', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_phq9_depression_screen_updated_at
    BEFORE UPDATE ON assessment_phq9_depression_screen
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_phq9_depression_screen IS
    'PHQ-9 (Patient Health Questionnaire-9) depression screening section. Scores: 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-19 Moderately severe, 20-27 Severe. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_phq9_depression_screen.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q1_little_interest IS
    'PHQ-9 Q1: Little interest or pleasure in doing things (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q2_feeling_down IS
    'PHQ-9 Q2: Feeling down, depressed, or hopeless (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q3_sleep_problems IS
    'PHQ-9 Q3: Trouble falling/staying asleep or sleeping too much (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q4_feeling_tired IS
    'PHQ-9 Q4: Feeling tired or having little energy (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q5_appetite_changes IS
    'PHQ-9 Q5: Poor appetite or overeating (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q6_feeling_bad_about_self IS
    'PHQ-9 Q6: Feeling bad about yourself or that you are a failure (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q7_trouble_concentrating IS
    'PHQ-9 Q7: Trouble concentrating on things like reading or watching TV (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q8_moving_slowly_or_fidgety IS
    'PHQ-9 Q8: Moving or speaking slowly, or being fidgety/restless (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.q9_thoughts_of_self_harm IS
    'PHQ-9 Q9: Thoughts of being better off dead or hurting yourself (0-3).';
COMMENT ON COLUMN assessment_phq9_depression_screen.phq9_total_score IS
    'PHQ-9 total score (sum of Q1-Q9, range 0-27).';
COMMENT ON COLUMN assessment_phq9_depression_screen.difficulty_level IS
    'PHQ-9 functional difficulty question: how difficult have these problems made it to do work, take care of things, or get along with others.';
