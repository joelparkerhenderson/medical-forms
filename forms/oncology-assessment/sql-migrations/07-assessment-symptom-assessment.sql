-- 07_assessment_symptom_assessment.sql
-- Symptom assessment section of the oncology assessment.

CREATE TABLE assessment_symptom_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pain_severity INTEGER
        CHECK (pain_severity IS NULL OR (pain_severity >= 0 AND pain_severity <= 10)),
    pain_location TEXT NOT NULL DEFAULT '',
    pain_character TEXT NOT NULL DEFAULT '',
    fatigue_severity INTEGER
        CHECK (fatigue_severity IS NULL OR (fatigue_severity >= 0 AND fatigue_severity <= 10)),
    nausea_severity INTEGER
        CHECK (nausea_severity IS NULL OR (nausea_severity >= 0 AND nausea_severity <= 10)),
    vomiting_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vomiting_frequency IN ('none', 'occasional', 'frequent', 'persistent', '')),
    appetite_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (appetite_level IN ('normal', 'reduced', 'poor', 'none', '')),
    dyspnoea_severity INTEGER
        CHECK (dyspnoea_severity IS NULL OR (dyspnoea_severity >= 0 AND dyspnoea_severity <= 10)),
    constipation_severity INTEGER
        CHECK (constipation_severity IS NULL OR (constipation_severity >= 0 AND constipation_severity <= 10)),
    diarrhoea_severity INTEGER
        CHECK (diarrhoea_severity IS NULL OR (diarrhoea_severity >= 0 AND diarrhoea_severity <= 10)),
    insomnia_severity INTEGER
        CHECK (insomnia_severity IS NULL OR (insomnia_severity >= 0 AND insomnia_severity <= 10)),
    cognitive_changes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cognitive_changes IN ('yes', 'no', '')),
    cognitive_changes_details TEXT NOT NULL DEFAULT '',
    other_symptoms TEXT NOT NULL DEFAULT '',
    symptom_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_symptom_assessment_updated_at
    BEFORE UPDATE ON assessment_symptom_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_symptom_assessment IS
    'Symptom assessment section: pain, fatigue, gastrointestinal symptoms, dyspnoea, and other cancer-related symptoms. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_symptom_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_symptom_assessment.pain_severity IS
    'Pain severity on 0-10 numeric rating scale (0 = no pain, 10 = worst pain).';
COMMENT ON COLUMN assessment_symptom_assessment.pain_location IS
    'Description of pain location(s).';
COMMENT ON COLUMN assessment_symptom_assessment.pain_character IS
    'Description of pain character (e.g. aching, burning, sharp, throbbing).';
COMMENT ON COLUMN assessment_symptom_assessment.fatigue_severity IS
    'Fatigue severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_assessment.nausea_severity IS
    'Nausea severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_assessment.vomiting_frequency IS
    'Vomiting frequency: none, occasional, frequent, persistent, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.appetite_level IS
    'Appetite level: normal, reduced, poor, none, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.dyspnoea_severity IS
    'Dyspnoea (breathlessness) severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_assessment.constipation_severity IS
    'Constipation severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_assessment.diarrhoea_severity IS
    'Diarrhoea severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_assessment.insomnia_severity IS
    'Insomnia severity on 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_symptom_assessment.cognitive_changes IS
    'Whether cognitive changes (chemo brain) are present: yes, no, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.cognitive_changes_details IS
    'Details of cognitive changes if present.';
COMMENT ON COLUMN assessment_symptom_assessment.other_symptoms IS
    'Other symptoms not covered above.';
COMMENT ON COLUMN assessment_symptom_assessment.symptom_notes IS
    'Additional clinician notes on symptom assessment.';
