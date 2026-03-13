-- 11_assessment_radiographic_findings.sql
-- Step 9: Radiographic findings section of the dental assessment.

CREATE TABLE assessment_radiographic_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    radiographs_taken VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (radiographs_taken IN ('yes', 'no', '')),
    radiograph_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (radiograph_type IN ('periapical', 'bitewing', 'opg', 'cbct', 'lateral_ceph', 'occlusal', '')),
    radiograph_date DATE,
    periapical_pathology VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (periapical_pathology IN ('yes', 'no', '')),
    periapical_details TEXT NOT NULL DEFAULT '',
    bone_loss_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (bone_loss_pattern IN ('none', 'horizontal', 'vertical', 'combined', '')),
    bone_loss_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (bone_loss_severity IN ('mild', 'moderate', 'severe', '')),
    bone_loss_details TEXT NOT NULL DEFAULT '',
    impacted_teeth VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (impacted_teeth IN ('yes', 'no', '')),
    impacted_teeth_details TEXT NOT NULL DEFAULT '',
    caries_detected VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (caries_detected IN ('yes', 'no', '')),
    caries_details TEXT NOT NULL DEFAULT '',
    root_resorption VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (root_resorption IN ('yes', 'no', '')),
    root_resorption_details TEXT NOT NULL DEFAULT '',
    other_pathology VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (other_pathology IN ('yes', 'no', '')),
    other_pathology_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_radiographic_findings_updated_at
    BEFORE UPDATE ON assessment_radiographic_findings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_radiographic_findings IS
    'Step 9 Radiographic Findings: dental radiograph results and pathology detection. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_radiographic_findings.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_radiographic_findings.radiographs_taken IS
    'Whether radiographs were taken during this assessment.';
COMMENT ON COLUMN assessment_radiographic_findings.radiograph_type IS
    'Type of radiograph: periapical, bitewing, OPG, CBCT, lateral cephalometric, or occlusal.';
COMMENT ON COLUMN assessment_radiographic_findings.radiograph_date IS
    'Date the radiographs were taken, NULL if unanswered.';
COMMENT ON COLUMN assessment_radiographic_findings.periapical_pathology IS
    'Whether periapical pathology was detected.';
COMMENT ON COLUMN assessment_radiographic_findings.periapical_details IS
    'Details of periapical pathology including affected teeth.';
COMMENT ON COLUMN assessment_radiographic_findings.bone_loss_pattern IS
    'Pattern of alveolar bone loss: none, horizontal, vertical, or combined.';
COMMENT ON COLUMN assessment_radiographic_findings.bone_loss_severity IS
    'Severity of alveolar bone loss: mild, moderate, or severe.';
COMMENT ON COLUMN assessment_radiographic_findings.bone_loss_details IS
    'Details of bone loss including affected regions.';
COMMENT ON COLUMN assessment_radiographic_findings.impacted_teeth IS
    'Whether impacted teeth were detected.';
COMMENT ON COLUMN assessment_radiographic_findings.impacted_teeth_details IS
    'Details of impacted teeth including tooth numbers and angulation.';
COMMENT ON COLUMN assessment_radiographic_findings.caries_detected IS
    'Whether radiographic caries were detected beyond clinical examination.';
COMMENT ON COLUMN assessment_radiographic_findings.caries_details IS
    'Details of radiographically detected caries.';
COMMENT ON COLUMN assessment_radiographic_findings.root_resorption IS
    'Whether root resorption was detected.';
COMMENT ON COLUMN assessment_radiographic_findings.root_resorption_details IS
    'Details of root resorption.';
COMMENT ON COLUMN assessment_radiographic_findings.other_pathology IS
    'Whether any other radiographic pathology was detected.';
COMMENT ON COLUMN assessment_radiographic_findings.other_pathology_details IS
    'Details of other pathology (e.g. cysts, tumours, supernumerary teeth).';
COMMENT ON COLUMN assessment_radiographic_findings.additional_notes IS
    'Additional radiographic findings and clinical notes.';
