-- 05_assessment_gad7_anxiety_screen.sql
-- GAD-7 Anxiety Screen section of the mental health assessment.

CREATE TABLE assessment_gad7_anxiety_screen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- GAD-7 items: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day
    q1_feeling_nervous INTEGER
        CHECK (q1_feeling_nervous IS NULL OR (q1_feeling_nervous >= 0 AND q1_feeling_nervous <= 3)),
    q2_uncontrollable_worrying INTEGER
        CHECK (q2_uncontrollable_worrying IS NULL OR (q2_uncontrollable_worrying >= 0 AND q2_uncontrollable_worrying <= 3)),
    q3_worrying_too_much INTEGER
        CHECK (q3_worrying_too_much IS NULL OR (q3_worrying_too_much >= 0 AND q3_worrying_too_much <= 3)),
    q4_trouble_relaxing INTEGER
        CHECK (q4_trouble_relaxing IS NULL OR (q4_trouble_relaxing >= 0 AND q4_trouble_relaxing <= 3)),
    q5_restlessness INTEGER
        CHECK (q5_restlessness IS NULL OR (q5_restlessness >= 0 AND q5_restlessness <= 3)),
    q6_easily_annoyed INTEGER
        CHECK (q6_easily_annoyed IS NULL OR (q6_easily_annoyed >= 0 AND q6_easily_annoyed <= 3)),
    q7_feeling_afraid INTEGER
        CHECK (q7_feeling_afraid IS NULL OR (q7_feeling_afraid >= 0 AND q7_feeling_afraid <= 3)),
    gad7_total_score INTEGER
        CHECK (gad7_total_score IS NULL OR (gad7_total_score >= 0 AND gad7_total_score <= 21)),
    difficulty_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (difficulty_level IN ('not-difficult', 'somewhat-difficult', 'very-difficult', 'extremely-difficult', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gad7_anxiety_screen_updated_at
    BEFORE UPDATE ON assessment_gad7_anxiety_screen
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gad7_anxiety_screen IS
    'GAD-7 (Generalised Anxiety Disorder-7) anxiety screening section. Scores: 0-4 Minimal, 5-9 Mild, 10-14 Moderate, 15-21 Severe. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q1_feeling_nervous IS
    'GAD-7 Q1: Feeling nervous, anxious, or on edge (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q2_uncontrollable_worrying IS
    'GAD-7 Q2: Not being able to stop or control worrying (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q3_worrying_too_much IS
    'GAD-7 Q3: Worrying too much about different things (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q4_trouble_relaxing IS
    'GAD-7 Q4: Trouble relaxing (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q5_restlessness IS
    'GAD-7 Q5: Being so restless it is hard to sit still (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q6_easily_annoyed IS
    'GAD-7 Q6: Becoming easily annoyed or irritable (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.q7_feeling_afraid IS
    'GAD-7 Q7: Feeling afraid as if something awful might happen (0-3).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.gad7_total_score IS
    'GAD-7 total score (sum of Q1-Q7, range 0-21).';
COMMENT ON COLUMN assessment_gad7_anxiety_screen.difficulty_level IS
    'GAD-7 functional difficulty question: how difficult have these problems made it to do work, take care of things, or get along with others.';
