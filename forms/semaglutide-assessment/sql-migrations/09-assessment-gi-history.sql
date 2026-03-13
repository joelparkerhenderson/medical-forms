-- 09_assessment_gi_history.sql
-- Gastrointestinal history section of the semaglutide assessment.

CREATE TABLE assessment_gi_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    history_of_nausea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_nausea IN ('yes', 'no', '')),
    history_of_vomiting VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_vomiting IN ('yes', 'no', '')),
    chronic_diarrhoea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_diarrhoea IN ('yes', 'no', '')),
    chronic_constipation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (chronic_constipation IN ('yes', 'no', '')),
    gastroesophageal_reflux VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gastroesophageal_reflux IN ('yes', 'no', '')),
    gastroparesis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gastroparesis IN ('yes', 'no', '')),
    inflammatory_bowel_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inflammatory_bowel_disease IN ('yes', 'no', '')),
    ibd_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ibd_type IN ('crohns', 'ulcerative_colitis', '')),
    irritable_bowel_syndrome VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (irritable_bowel_syndrome IN ('yes', 'no', '')),
    previous_gi_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_gi_surgery IN ('yes', 'no', '')),
    gi_surgery_details TEXT NOT NULL DEFAULT '',
    previous_bariatric_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_bariatric_surgery IN ('yes', 'no', '')),
    bariatric_surgery_type TEXT NOT NULL DEFAULT '',
    current_gi_symptoms TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gi_history_updated_at
    BEFORE UPDATE ON assessment_gi_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gi_history IS
    'Gastrointestinal history section: GI conditions and surgical history relevant to GLP-1 RA tolerance. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gi_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gi_history.history_of_nausea IS
    'Whether patient has chronic nausea (GLP-1 RAs commonly cause nausea).';
COMMENT ON COLUMN assessment_gi_history.history_of_vomiting IS
    'Whether patient has chronic vomiting.';
COMMENT ON COLUMN assessment_gi_history.chronic_diarrhoea IS
    'Whether patient has chronic diarrhoea.';
COMMENT ON COLUMN assessment_gi_history.chronic_constipation IS
    'Whether patient has chronic constipation.';
COMMENT ON COLUMN assessment_gi_history.gastroesophageal_reflux IS
    'Whether patient has gastroesophageal reflux disease (GORD/GERD).';
COMMENT ON COLUMN assessment_gi_history.gastroparesis IS
    'Whether patient has gastroparesis (GLP-1 RAs delay gastric emptying).';
COMMENT ON COLUMN assessment_gi_history.inflammatory_bowel_disease IS
    'Whether patient has inflammatory bowel disease.';
COMMENT ON COLUMN assessment_gi_history.ibd_type IS
    'Type of IBD: crohns, ulcerative_colitis, or empty string if unanswered.';
COMMENT ON COLUMN assessment_gi_history.irritable_bowel_syndrome IS
    'Whether patient has irritable bowel syndrome.';
COMMENT ON COLUMN assessment_gi_history.previous_gi_surgery IS
    'Whether patient has had previous gastrointestinal surgery.';
COMMENT ON COLUMN assessment_gi_history.gi_surgery_details IS
    'Details of previous GI surgery.';
COMMENT ON COLUMN assessment_gi_history.previous_bariatric_surgery IS
    'Whether patient has had previous bariatric surgery.';
COMMENT ON COLUMN assessment_gi_history.bariatric_surgery_type IS
    'Type and details of previous bariatric surgery.';
COMMENT ON COLUMN assessment_gi_history.current_gi_symptoms IS
    'Free-text description of current gastrointestinal symptoms.';
