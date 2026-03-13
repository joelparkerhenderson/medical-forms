-- ============================================================
-- 09_assessment_psychological_wellbeing.sql
-- Psychological wellbeing section (1:1 with assessment).
-- ============================================================

CREATE TABLE assessment_psychological_wellbeing (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    diabetes_distress       INTEGER CHECK (diabetes_distress IS NULL OR (diabetes_distress >= 1 AND diabetes_distress <= 5)),
    depression_screening    INTEGER CHECK (depression_screening IS NULL OR (depression_screening >= 0 AND depression_screening <= 10)),
    anxiety_screening       INTEGER CHECK (anxiety_screening IS NULL OR (anxiety_screening >= 0 AND anxiety_screening <= 10)),
    eating_disorder         TEXT NOT NULL DEFAULT ''
                            CHECK (eating_disorder IN ('yes', 'no', '')),
    fear_of_hypoglycaemia   INTEGER CHECK (fear_of_hypoglycaemia IS NULL OR (fear_of_hypoglycaemia >= 1 AND fear_of_hypoglycaemia <= 5)),
    coping_ability          INTEGER CHECK (coping_ability IS NULL OR (coping_ability >= 1 AND coping_ability <= 5)),
    needs_support           TEXT NOT NULL DEFAULT ''
                            CHECK (needs_support IN ('yes', 'no', '')),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_psychological_wellbeing_updated_at
    BEFORE UPDATE ON assessment_psychological_wellbeing
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychological_wellbeing IS
    '1:1 with assessment. Psychological impact of diabetes and support needs.';
COMMENT ON COLUMN assessment_psychological_wellbeing.diabetes_distress IS
    'Diabetes distress level (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN assessment_psychological_wellbeing.depression_screening IS
    'PHQ-2 depression screening score (0-6, extended to 0-10). NULL if unanswered.';
COMMENT ON COLUMN assessment_psychological_wellbeing.anxiety_screening IS
    'GAD-2 anxiety screening score (0-6, extended to 0-10). NULL if unanswered.';
COMMENT ON COLUMN assessment_psychological_wellbeing.fear_of_hypoglycaemia IS
    'Fear of hypoglycaemia level (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN assessment_psychological_wellbeing.coping_ability IS
    'Self-rated coping with diabetes (1-5 Likert). NULL if unanswered.';
COMMENT ON COLUMN assessment_psychological_wellbeing.needs_support IS
    'Whether patient needs psychological support: yes, no, or empty string.';
