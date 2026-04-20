-- 04_assessment_seasonal_pattern_history.sql
-- Seasonal pattern history section using SPAQ Global Seasonality Score items.

CREATE TABLE assessment_seasonal_pattern_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    worst_month VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (worst_month IN ('january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december', '')),
    best_month VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (best_month IN ('january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december', '')),
    years_of_seasonal_symptoms INTEGER
        CHECK (years_of_seasonal_symptoms IS NULL OR years_of_seasonal_symptoms >= 0),
    gss_sleep_length INTEGER NOT NULL DEFAULT 0
        CHECK (gss_sleep_length >= 0 AND gss_sleep_length <= 4),
    gss_social_activity INTEGER NOT NULL DEFAULT 0
        CHECK (gss_social_activity >= 0 AND gss_social_activity <= 4),
    gss_mood INTEGER NOT NULL DEFAULT 0
        CHECK (gss_mood >= 0 AND gss_mood <= 4),
    gss_weight INTEGER NOT NULL DEFAULT 0
        CHECK (gss_weight >= 0 AND gss_weight <= 4),
    gss_appetite INTEGER NOT NULL DEFAULT 0
        CHECK (gss_appetite >= 0 AND gss_appetite <= 4),
    gss_energy INTEGER NOT NULL DEFAULT 0
        CHECK (gss_energy >= 0 AND gss_energy <= 4),
    gss_total INTEGER NOT NULL DEFAULT 0
        CHECK (gss_total >= 0 AND gss_total <= 24),
    seasonal_pattern_is_problem VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (seasonal_pattern_is_problem IN ('no', 'mild', 'moderate', 'marked', 'severe', 'disabling', '')),
    seasonal_pattern_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_seasonal_pattern_history_updated_at
    BEFORE UPDATE ON assessment_seasonal_pattern_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_seasonal_pattern_history IS
    'Seasonal pattern history section: SPAQ Global Seasonality Score items (6 domains, each 0-4, total 0-24). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_seasonal_pattern_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.worst_month IS
    'Month when patient feels worst.';
COMMENT ON COLUMN assessment_seasonal_pattern_history.best_month IS
    'Month when patient feels best.';
COMMENT ON COLUMN assessment_seasonal_pattern_history.years_of_seasonal_symptoms IS
    'Number of years the patient has experienced seasonal symptoms.';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_sleep_length IS
    'SPAQ GSS: degree of seasonal change in sleep length (0=none, 4=extremely marked).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_social_activity IS
    'SPAQ GSS: degree of seasonal change in social activity (0=none, 4=extremely marked).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_mood IS
    'SPAQ GSS: degree of seasonal change in mood (0=none, 4=extremely marked).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_weight IS
    'SPAQ GSS: degree of seasonal change in weight (0=none, 4=extremely marked).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_appetite IS
    'SPAQ GSS: degree of seasonal change in appetite (0=none, 4=extremely marked).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_energy IS
    'SPAQ GSS: degree of seasonal change in energy level (0=none, 4=extremely marked).';
COMMENT ON COLUMN assessment_seasonal_pattern_history.gss_total IS
    'SPAQ GSS total score (sum of 6 items, 0-24). 0-7 no SAD, 8-10 subsyndromal, 11-24 SAD likely.';
COMMENT ON COLUMN assessment_seasonal_pattern_history.seasonal_pattern_is_problem IS
    'Self-rating of whether seasonal changes are a problem: no, mild, moderate, marked, severe, disabling, or empty.';
COMMENT ON COLUMN assessment_seasonal_pattern_history.seasonal_pattern_notes IS
    'Additional notes on seasonal pattern history.';
