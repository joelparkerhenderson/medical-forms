-- 07_assessment_periodontal.sql
-- Step 5: Periodontal assessment section.

CREATE TABLE assessment_periodontal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gingival_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (gingival_status IN ('healthy', 'gingivitis', 'periodontitis_mild', 'periodontitis_moderate', 'periodontitis_severe', '')),
    bleeding_on_probing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bleeding_on_probing IN ('yes', 'no', '')),
    bleeding_sites TEXT NOT NULL DEFAULT '',
    probing_depth_max INTEGER
        CHECK (probing_depth_max IS NULL OR (probing_depth_max >= 0 AND probing_depth_max <= 15)),
    probing_depth_mean NUMERIC(3,1)
        CHECK (probing_depth_mean IS NULL OR (probing_depth_mean >= 0 AND probing_depth_mean <= 15)),
    clinical_attachment_loss VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (clinical_attachment_loss IN ('none', 'mild_1_2mm', 'moderate_3_4mm', 'severe_5mm_plus', '')),
    furcation_involvement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (furcation_involvement IN ('yes', 'no', '')),
    furcation_details TEXT NOT NULL DEFAULT '',
    tooth_mobility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tooth_mobility IN ('none', 'grade_1', 'grade_2', 'grade_3', '')),
    mobility_details TEXT NOT NULL DEFAULT '',
    plaque_index_score NUMERIC(4,1)
        CHECK (plaque_index_score IS NULL OR (plaque_index_score >= 0 AND plaque_index_score <= 100)),
    calculus_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (calculus_present IN ('yes', 'no', '')),
    calculus_location TEXT NOT NULL DEFAULT '',
    gingival_recession VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gingival_recession IN ('yes', 'no', '')),
    recession_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_periodontal_updated_at
    BEFORE UPDATE ON assessment_periodontal
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_periodontal IS
    'Step 5 Periodontal Assessment: gingival health, probing depths, attachment loss, and mobility. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_periodontal.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_periodontal.gingival_status IS
    'Overall gingival status classification.';
COMMENT ON COLUMN assessment_periodontal.bleeding_on_probing IS
    'Whether bleeding on probing is present.';
COMMENT ON COLUMN assessment_periodontal.bleeding_sites IS
    'Specific sites exhibiting bleeding on probing.';
COMMENT ON COLUMN assessment_periodontal.probing_depth_max IS
    'Maximum probing depth recorded in millimetres.';
COMMENT ON COLUMN assessment_periodontal.probing_depth_mean IS
    'Mean probing depth across all measured sites in millimetres.';
COMMENT ON COLUMN assessment_periodontal.clinical_attachment_loss IS
    'Clinical attachment loss classification.';
COMMENT ON COLUMN assessment_periodontal.furcation_involvement IS
    'Whether furcation involvement is present in multi-rooted teeth.';
COMMENT ON COLUMN assessment_periodontal.furcation_details IS
    'Details of furcation involvement including affected teeth and grade.';
COMMENT ON COLUMN assessment_periodontal.tooth_mobility IS
    'Highest grade of tooth mobility detected.';
COMMENT ON COLUMN assessment_periodontal.mobility_details IS
    'Details of mobile teeth and their grades.';
COMMENT ON COLUMN assessment_periodontal.plaque_index_score IS
    'Plaque index score as a percentage (0-100).';
COMMENT ON COLUMN assessment_periodontal.calculus_present IS
    'Whether calculus deposits are present.';
COMMENT ON COLUMN assessment_periodontal.calculus_location IS
    'Location of calculus deposits.';
COMMENT ON COLUMN assessment_periodontal.gingival_recession IS
    'Whether gingival recession is present.';
COMMENT ON COLUMN assessment_periodontal.recession_details IS
    'Details of gingival recession including affected teeth and measurements.';
