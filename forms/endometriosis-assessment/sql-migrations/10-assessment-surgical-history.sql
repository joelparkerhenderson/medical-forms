-- 10_assessment_surgical_history.sql
-- Surgical history section of the endometriosis assessment.

CREATE TABLE assessment_surgical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_laparoscopy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_laparoscopy IN ('yes', 'no', '')),
    number_of_laparoscopies INTEGER
        CHECK (number_of_laparoscopies IS NULL OR number_of_laparoscopies >= 0),
    most_recent_laparoscopy_date DATE,
    endometriosis_confirmed_surgically VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (endometriosis_confirmed_surgically IN ('yes', 'no', '')),
    histological_confirmation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (histological_confirmation IN ('yes', 'no', '')),
    asrm_stage_at_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asrm_stage_at_surgery IN ('I', 'II', 'III', 'IV', '')),
    sites_found TEXT NOT NULL DEFAULT '',
    excision_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (excision_performed IN ('yes', 'no', '')),
    ablation_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ablation_performed IN ('yes', 'no', '')),
    adhesiolysis_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adhesiolysis_performed IN ('yes', 'no', '')),
    endometrioma_drained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (endometrioma_drained IN ('yes', 'no', '')),
    bowel_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bowel_surgery IN ('yes', 'no', '')),
    bladder_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bladder_surgery IN ('yes', 'no', '')),
    other_pelvic_surgery TEXT NOT NULL DEFAULT '',
    surgical_complications TEXT NOT NULL DEFAULT '',
    surgical_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_surgical_history_updated_at
    BEFORE UPDATE ON assessment_surgical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_surgical_history IS
    'Surgical history section: laparoscopy details, ASRM staging, procedures performed. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_surgical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_surgical_history.previous_laparoscopy IS
    'Whether the patient has had a previous laparoscopy: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.number_of_laparoscopies IS
    'Total number of previous laparoscopies.';
COMMENT ON COLUMN assessment_surgical_history.most_recent_laparoscopy_date IS
    'Date of the most recent laparoscopy.';
COMMENT ON COLUMN assessment_surgical_history.endometriosis_confirmed_surgically IS
    'Whether endometriosis was confirmed at surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.histological_confirmation IS
    'Whether histological (biopsy) confirmation was obtained: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.asrm_stage_at_surgery IS
    'ASRM stage documented at surgery: I, II, III, IV, or empty.';
COMMENT ON COLUMN assessment_surgical_history.sites_found IS
    'Anatomical sites where endometriosis was found.';
COMMENT ON COLUMN assessment_surgical_history.excision_performed IS
    'Whether excision of endometriosis was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.ablation_performed IS
    'Whether ablation of endometriosis was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.adhesiolysis_performed IS
    'Whether adhesiolysis was performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.endometrioma_drained IS
    'Whether an endometrioma was drained or excised: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.bowel_surgery IS
    'Whether bowel surgery was performed for endometriosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.bladder_surgery IS
    'Whether bladder surgery was performed for endometriosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.other_pelvic_surgery IS
    'Other pelvic surgery performed.';
COMMENT ON COLUMN assessment_surgical_history.surgical_complications IS
    'Any complications from previous surgery.';
COMMENT ON COLUMN assessment_surgical_history.surgical_notes IS
    'Additional clinician notes on surgical history.';
