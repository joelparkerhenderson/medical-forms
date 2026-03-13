-- 06_assessment_gastrointestinal_symptoms.sql
-- Gastrointestinal symptoms section of the MCAS assessment.

CREATE TABLE assessment_gastrointestinal_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    abdominal_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (abdominal_pain IN ('yes', 'no', '')),
    abdominal_pain_severity INTEGER
        CHECK (abdominal_pain_severity IS NULL OR (abdominal_pain_severity >= 0 AND abdominal_pain_severity <= 10)),
    nausea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nausea IN ('yes', 'no', '')),
    vomiting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vomiting IN ('yes', 'no', '')),
    diarrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diarrhoea IN ('yes', 'no', '')),
    diarrhoea_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diarrhoea_frequency IN ('daily', 'weekly', 'monthly', 'rarely', '')),
    bloating VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bloating IN ('yes', 'no', '')),
    gastro_oesophageal_reflux VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gastro_oesophageal_reflux IN ('yes', 'no', '')),
    dysphagia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dysphagia IN ('yes', 'no', '')),
    food_intolerances TEXT NOT NULL DEFAULT '',
    weight_change VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (weight_change IN ('gain', 'loss', 'stable', '')),
    weight_change_amount_kg NUMERIC(5,1),
    gastrointestinal_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gastrointestinal_symptoms_updated_at
    BEFORE UPDATE ON assessment_gastrointestinal_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gastrointestinal_symptoms IS
    'Gastrointestinal symptoms section: abdominal pain, nausea, diarrhoea, reflux, and food intolerances. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.abdominal_pain IS
    'Whether the patient experiences abdominal pain: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.abdominal_pain_severity IS
    'Abdominal pain severity on a 0-10 numeric rating scale.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.nausea IS
    'Whether the patient experiences nausea: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.vomiting IS
    'Whether the patient experiences vomiting: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.diarrhoea IS
    'Whether the patient experiences diarrhoea: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.diarrhoea_frequency IS
    'How often diarrhoea occurs: daily, weekly, monthly, rarely, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.bloating IS
    'Whether the patient experiences bloating: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.gastro_oesophageal_reflux IS
    'Whether the patient experiences gastro-oesophageal reflux: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.dysphagia IS
    'Whether the patient experiences difficulty swallowing: yes, no, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.food_intolerances IS
    'Free-text list of known food intolerances or sensitivities.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.weight_change IS
    'Recent weight change: gain, loss, stable, or empty string.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.weight_change_amount_kg IS
    'Amount of weight change in kilograms, if applicable.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.gastrointestinal_notes IS
    'Free-text clinician notes on gastrointestinal findings.';
