-- ============================================================
-- 07_assessment_current_symptoms.sql
-- Current symptoms data (1:1 with assessment).
-- Pain locations stored as TEXT[] array.
-- ============================================================

CREATE TABLE assessment_current_symptoms (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Pain locations stored as an array of body region identifiers
    pain_locations      TEXT[] NOT NULL DEFAULT '{}',
    pain_severity       INTEGER CHECK (pain_severity IS NULL OR (pain_severity >= 0 AND pain_severity <= 10)),
    onset_date          DATE,
    duration            TEXT NOT NULL DEFAULT ''
                        CHECK (duration IN ('less-than-1-week', '1-4-weeks', '1-3-months', '3-6-months', 'more-than-6-months', '')),
    aggravating_factors TEXT NOT NULL DEFAULT '',
    relieving_factors   TEXT NOT NULL DEFAULT '',
    impact_on_work      TEXT NOT NULL DEFAULT ''
                        CHECK (impact_on_work IN ('none', 'mild', 'moderate', 'severe', 'unable-to-work', '')),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_current_symptoms_updated_at
    BEFORE UPDATE ON assessment_current_symptoms
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_symptoms IS
    'Current symptoms: pain locations, severity, onset, duration, aggravating/relieving factors, work impact.';
COMMENT ON COLUMN assessment_current_symptoms.pain_locations IS
    'Array of body region identifiers where pain is experienced (e.g. neck, lower-back, right-wrist-hand).';
COMMENT ON COLUMN assessment_current_symptoms.pain_severity IS
    'Pain severity on a 0-10 numeric rating scale. NULL if not assessed.';
COMMENT ON COLUMN assessment_current_symptoms.onset_date IS
    'Date when symptoms first appeared. NULL if unknown.';
COMMENT ON COLUMN assessment_current_symptoms.duration IS
    'Symptom duration category: less-than-1-week through more-than-6-months, or empty.';
COMMENT ON COLUMN assessment_current_symptoms.aggravating_factors IS
    'Free-text description of factors that worsen symptoms.';
COMMENT ON COLUMN assessment_current_symptoms.relieving_factors IS
    'Free-text description of factors that relieve symptoms.';
COMMENT ON COLUMN assessment_current_symptoms.impact_on_work IS
    'Impact on work ability: none, mild, moderate, severe, unable-to-work, or empty.';
