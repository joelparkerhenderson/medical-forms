-- 09_assessment_surgical.sql
-- Surgical assessment section of the organ donation assessment.

CREATE TABLE assessment_surgical (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    abdominal_anatomy_normal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (abdominal_anatomy_normal IN ('yes', 'no', '')),
    abdominal_anatomy_findings TEXT NOT NULL DEFAULT '',
    vascular_anatomy_normal VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vascular_anatomy_normal IN ('yes', 'no', '')),
    vascular_anatomy_findings TEXT NOT NULL DEFAULT '',
    ct_angiogram_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ct_angiogram_performed IN ('yes', 'no', '')),
    ct_angiogram_findings TEXT NOT NULL DEFAULT '',
    number_of_renal_arteries VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (number_of_renal_arteries IN ('1', '2', '3+', '')),
    previous_abdominal_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_abdominal_surgery IN ('yes', 'no', '')),
    previous_abdominal_surgery_details TEXT NOT NULL DEFAULT '',
    anaesthetic_risk VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anaesthetic_risk IN ('asa-1', 'asa-2', 'asa-3', 'asa-4', 'asa-5', '')),
    surgical_fitness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (surgical_fitness IN ('fit', 'conditionally-fit', 'unfit', '')),
    surgical_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_surgical_updated_at
    BEFORE UPDATE ON assessment_surgical
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_surgical IS
    'Surgical assessment section: anatomy, imaging, anaesthetic risk, and surgical fitness. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_surgical.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_surgical.abdominal_anatomy_normal IS
    'Whether abdominal anatomy is normal: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical.abdominal_anatomy_findings IS
    'Abdominal anatomy findings if abnormal.';
COMMENT ON COLUMN assessment_surgical.vascular_anatomy_normal IS
    'Whether vascular anatomy is normal: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical.vascular_anatomy_findings IS
    'Vascular anatomy findings if abnormal.';
COMMENT ON COLUMN assessment_surgical.ct_angiogram_performed IS
    'Whether CT angiogram has been performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical.ct_angiogram_findings IS
    'CT angiogram findings.';
COMMENT ON COLUMN assessment_surgical.number_of_renal_arteries IS
    'Number of renal arteries: 1, 2, 3+, or empty.';
COMMENT ON COLUMN assessment_surgical.previous_abdominal_surgery IS
    'Whether donor has had previous abdominal surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical.previous_abdominal_surgery_details IS
    'Details of previous abdominal surgery.';
COMMENT ON COLUMN assessment_surgical.anaesthetic_risk IS
    'ASA physical status classification: asa-1 to asa-5, or empty.';
COMMENT ON COLUMN assessment_surgical.surgical_fitness IS
    'Overall surgical fitness: fit, conditionally-fit, unfit, or empty.';
COMMENT ON COLUMN assessment_surgical.surgical_notes IS
    'Additional clinician notes on surgical assessment.';
