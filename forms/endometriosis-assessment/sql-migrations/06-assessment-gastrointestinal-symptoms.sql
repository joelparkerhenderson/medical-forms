-- 06_assessment_gastrointestinal_symptoms.sql
-- Gastrointestinal symptoms section of the endometriosis assessment.

CREATE TABLE assessment_gastrointestinal_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_gi_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_gi_symptoms IN ('yes', 'no', '')),
    bloating VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bloating IN ('yes', 'no', '')),
    bloating_cyclical VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bloating_cyclical IN ('yes', 'no', '')),
    nausea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nausea IN ('yes', 'no', '')),
    constipation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (constipation IN ('yes', 'no', '')),
    diarrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diarrhoea IN ('yes', 'no', '')),
    alternating_bowel_habit VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alternating_bowel_habit IN ('yes', 'no', '')),
    rectal_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rectal_bleeding IN ('yes', 'no', '')),
    rectal_bleeding_cyclical VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (rectal_bleeding_cyclical IN ('yes', 'no', '')),
    bowel_obstruction_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bowel_obstruction_symptoms IN ('yes', 'no', '')),
    gi_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gastrointestinal_symptoms_updated_at
    BEFORE UPDATE ON assessment_gastrointestinal_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gastrointestinal_symptoms IS
    'Gastrointestinal symptoms section: bloating, bowel habit, rectal bleeding. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.has_gi_symptoms IS
    'Whether the patient has gastrointestinal symptoms: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.bloating IS
    'Abdominal bloating: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.bloating_cyclical IS
    'Whether bloating worsens with menstruation: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.nausea IS
    'Nausea: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.constipation IS
    'Constipation: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.diarrhoea IS
    'Diarrhoea: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.alternating_bowel_habit IS
    'Alternating constipation and diarrhoea: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.rectal_bleeding IS
    'Rectal bleeding: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.rectal_bleeding_cyclical IS
    'Whether rectal bleeding is cyclical with menstruation: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.bowel_obstruction_symptoms IS
    'Symptoms suggestive of bowel obstruction: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_symptoms.gi_notes IS
    'Additional clinician notes on gastrointestinal symptoms.';
