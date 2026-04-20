-- 08_assessment_gastrointestinal_function.sql
-- Gastrointestinal function section of the nutrition assessment.

CREATE TABLE assessment_gastrointestinal_function (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nausea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nausea IN ('yes', 'no', '')),
    vomiting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vomiting IN ('yes', 'no', '')),
    vomiting_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (vomiting_frequency IN ('occasional', 'daily', 'multiple-daily', '')),
    diarrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diarrhoea IN ('yes', 'no', '')),
    diarrhoea_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diarrhoea_frequency IN ('occasional', 'daily', 'multiple-daily', '')),
    constipation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (constipation IN ('yes', 'no', '')),
    abdominal_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (abdominal_pain IN ('yes', 'no', '')),
    abdominal_bloating VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (abdominal_bloating IN ('yes', 'no', '')),
    stoma VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (stoma IN ('yes', 'no', '')),
    stoma_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (stoma_type IN ('colostomy', 'ileostomy', 'jejunostomy', 'other', '')),
    bowel_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bowel_surgery IN ('yes', 'no', '')),
    bowel_surgery_details TEXT NOT NULL DEFAULT '',
    gi_function_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gastrointestinal_function_updated_at
    BEFORE UPDATE ON assessment_gastrointestinal_function
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gastrointestinal_function IS
    'Gastrointestinal function section: nausea, vomiting, bowel habit, stoma, and surgical history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gastrointestinal_function.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gastrointestinal_function.nausea IS
    'Whether the patient experiences nausea: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.vomiting IS
    'Whether the patient has vomiting: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.vomiting_frequency IS
    'Frequency of vomiting: occasional, daily, multiple-daily, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.diarrhoea IS
    'Whether the patient has diarrhoea: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.diarrhoea_frequency IS
    'Frequency of diarrhoea: occasional, daily, multiple-daily, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.constipation IS
    'Whether the patient has constipation: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.abdominal_pain IS
    'Whether the patient has abdominal pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.abdominal_bloating IS
    'Whether the patient has abdominal bloating: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.stoma IS
    'Whether the patient has a stoma: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.stoma_type IS
    'Type of stoma: colostomy, ileostomy, jejunostomy, other, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.bowel_surgery IS
    'Whether the patient has had bowel surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_gastrointestinal_function.bowel_surgery_details IS
    'Details of bowel surgery if applicable.';
COMMENT ON COLUMN assessment_gastrointestinal_function.gi_function_notes IS
    'Additional clinician notes on gastrointestinal function.';
