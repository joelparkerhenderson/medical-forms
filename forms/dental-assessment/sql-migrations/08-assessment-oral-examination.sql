-- 08_assessment_oral_examination.sql
-- Step 6: Oral examination section of the dental assessment.

CREATE TABLE assessment_oral_examination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    soft_tissue_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (soft_tissue_status IN ('normal', 'abnormal', '')),
    soft_tissue_findings TEXT NOT NULL DEFAULT '',
    tongue_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tongue_status IN ('normal', 'abnormal', '')),
    tongue_findings TEXT NOT NULL DEFAULT '',
    floor_of_mouth_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (floor_of_mouth_status IN ('normal', 'abnormal', '')),
    floor_of_mouth_findings TEXT NOT NULL DEFAULT '',
    palate_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (palate_status IN ('normal', 'abnormal', '')),
    palate_findings TEXT NOT NULL DEFAULT '',
    buccal_mucosa_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (buccal_mucosa_status IN ('normal', 'abnormal', '')),
    buccal_mucosa_findings TEXT NOT NULL DEFAULT '',
    lymph_node_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lymph_node_status IN ('normal', 'palpable', 'tender', '')),
    lymph_node_findings TEXT NOT NULL DEFAULT '',
    tmj_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tmj_status IN ('normal', 'clicking', 'crepitus', 'limited_opening', 'pain', '')),
    tmj_findings TEXT NOT NULL DEFAULT '',
    occlusion VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (occlusion IN ('class_i', 'class_ii_div_1', 'class_ii_div_2', 'class_iii', '')),
    occlusion_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_oral_examination_updated_at
    BEFORE UPDATE ON assessment_oral_examination
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_oral_examination IS
    'Step 6 Oral Examination: soft tissue, lymph nodes, TMJ, and occlusion findings. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_oral_examination.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_oral_examination.soft_tissue_status IS
    'Overall soft tissue status: normal or abnormal.';
COMMENT ON COLUMN assessment_oral_examination.soft_tissue_findings IS
    'Description of soft tissue abnormalities if present.';
COMMENT ON COLUMN assessment_oral_examination.tongue_status IS
    'Tongue examination status: normal or abnormal.';
COMMENT ON COLUMN assessment_oral_examination.tongue_findings IS
    'Description of tongue abnormalities if present.';
COMMENT ON COLUMN assessment_oral_examination.floor_of_mouth_status IS
    'Floor of mouth examination status.';
COMMENT ON COLUMN assessment_oral_examination.floor_of_mouth_findings IS
    'Description of floor of mouth findings.';
COMMENT ON COLUMN assessment_oral_examination.palate_status IS
    'Palate examination status: normal or abnormal.';
COMMENT ON COLUMN assessment_oral_examination.palate_findings IS
    'Description of palate abnormalities if present.';
COMMENT ON COLUMN assessment_oral_examination.buccal_mucosa_status IS
    'Buccal mucosa examination status.';
COMMENT ON COLUMN assessment_oral_examination.buccal_mucosa_findings IS
    'Description of buccal mucosa findings.';
COMMENT ON COLUMN assessment_oral_examination.lymph_node_status IS
    'Cervical lymph node palpation status.';
COMMENT ON COLUMN assessment_oral_examination.lymph_node_findings IS
    'Description of lymph node findings.';
COMMENT ON COLUMN assessment_oral_examination.tmj_status IS
    'Temporomandibular joint examination status.';
COMMENT ON COLUMN assessment_oral_examination.tmj_findings IS
    'Description of TMJ findings.';
COMMENT ON COLUMN assessment_oral_examination.occlusion IS
    'Angle classification of occlusion.';
COMMENT ON COLUMN assessment_oral_examination.occlusion_notes IS
    'Additional notes regarding occlusion and bite.';
