-- 09_assessment_previous_gi_history.sql
-- Step 7: Previous GI history section of the gastroenterology assessment.

CREATE TABLE assessment_previous_gi_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_ibs VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_ibs IN ('yes', 'no', '')),
    ibs_subtype VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ibs_subtype IN ('ibs_c', 'ibs_d', 'ibs_m', 'unspecified', '')),
    has_ibd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_ibd IN ('yes', 'no', '')),
    ibd_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (ibd_type IN ('crohns', 'ulcerative_colitis', 'indeterminate', '')),
    has_coeliac_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_coeliac_disease IN ('yes', 'no', '')),
    has_peptic_ulcer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_peptic_ulcer IN ('yes', 'no', '')),
    helicobacter_pylori_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (helicobacter_pylori_status IN ('positive', 'negative', 'eradicated', 'unknown', '')),
    has_gord VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_gord IN ('yes', 'no', '')),
    has_barretts_oesophagus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_barretts_oesophagus IN ('yes', 'no', '')),
    has_gi_malignancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_gi_malignancy IN ('yes', 'no', '')),
    gi_malignancy_details TEXT NOT NULL DEFAULT '',
    has_polyps VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_polyps IN ('yes', 'no', '')),
    polyp_details TEXT NOT NULL DEFAULT '',
    previous_endoscopy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_endoscopy IN ('yes', 'no', '')),
    endoscopy_date DATE,
    endoscopy_findings TEXT NOT NULL DEFAULT '',
    previous_colonoscopy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_colonoscopy IN ('yes', 'no', '')),
    colonoscopy_date DATE,
    colonoscopy_findings TEXT NOT NULL DEFAULT '',
    previous_gi_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_gi_surgery IN ('yes', 'no', '')),
    gi_surgery_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_previous_gi_history_updated_at
    BEFORE UPDATE ON assessment_previous_gi_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_previous_gi_history IS
    'Step 7 Previous GI History: prior gastrointestinal diagnoses, investigations, and surgeries. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_previous_gi_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_previous_gi_history.has_ibs IS
    'Whether the patient has been diagnosed with irritable bowel syndrome.';
COMMENT ON COLUMN assessment_previous_gi_history.ibs_subtype IS
    'IBS subtype: IBS-C (constipation), IBS-D (diarrhoea), IBS-M (mixed).';
COMMENT ON COLUMN assessment_previous_gi_history.has_ibd IS
    'Whether the patient has inflammatory bowel disease.';
COMMENT ON COLUMN assessment_previous_gi_history.ibd_type IS
    'Type of IBD: Crohn disease, ulcerative colitis, or indeterminate.';
COMMENT ON COLUMN assessment_previous_gi_history.has_coeliac_disease IS
    'Whether the patient has coeliac disease.';
COMMENT ON COLUMN assessment_previous_gi_history.has_peptic_ulcer IS
    'Whether the patient has a history of peptic ulcer disease.';
COMMENT ON COLUMN assessment_previous_gi_history.helicobacter_pylori_status IS
    'Helicobacter pylori status.';
COMMENT ON COLUMN assessment_previous_gi_history.has_gord IS
    'Whether the patient has gastro-oesophageal reflux disease.';
COMMENT ON COLUMN assessment_previous_gi_history.has_barretts_oesophagus IS
    'Whether the patient has Barrett oesophagus (pre-malignant condition).';
COMMENT ON COLUMN assessment_previous_gi_history.has_gi_malignancy IS
    'Whether the patient has a history of GI malignancy.';
COMMENT ON COLUMN assessment_previous_gi_history.gi_malignancy_details IS
    'Details of GI malignancy including type and treatment.';
COMMENT ON COLUMN assessment_previous_gi_history.has_polyps IS
    'Whether the patient has a history of GI polyps.';
COMMENT ON COLUMN assessment_previous_gi_history.polyp_details IS
    'Details of polyp history including number, type, and location.';
COMMENT ON COLUMN assessment_previous_gi_history.previous_endoscopy IS
    'Whether the patient has had a previous upper GI endoscopy.';
COMMENT ON COLUMN assessment_previous_gi_history.endoscopy_date IS
    'Date of most recent endoscopy, NULL if unanswered.';
COMMENT ON COLUMN assessment_previous_gi_history.endoscopy_findings IS
    'Findings from previous endoscopy.';
COMMENT ON COLUMN assessment_previous_gi_history.previous_colonoscopy IS
    'Whether the patient has had a previous colonoscopy.';
COMMENT ON COLUMN assessment_previous_gi_history.colonoscopy_date IS
    'Date of most recent colonoscopy, NULL if unanswered.';
COMMENT ON COLUMN assessment_previous_gi_history.colonoscopy_findings IS
    'Findings from previous colonoscopy.';
COMMENT ON COLUMN assessment_previous_gi_history.previous_gi_surgery IS
    'Whether the patient has had GI surgery.';
COMMENT ON COLUMN assessment_previous_gi_history.gi_surgery_details IS
    'Details of previous GI surgery.';
COMMENT ON COLUMN assessment_previous_gi_history.additional_notes IS
    'Additional notes about GI history.';
