-- 11_assessment_laboratory_results.sql
-- Laboratory results section of the MCAS assessment.

CREATE TABLE assessment_laboratory_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    serum_tryptase NUMERIC(7,2),
    serum_tryptase_date DATE,
    serum_tryptase_elevated VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (serum_tryptase_elevated IN ('yes', 'no', '')),
    plasma_histamine NUMERIC(7,2),
    plasma_histamine_date DATE,
    urine_n_methylhistamine NUMERIC(7,2),
    urine_n_methylhistamine_date DATE,
    urine_prostaglandin_d2 NUMERIC(7,2),
    urine_prostaglandin_d2_date DATE,
    urine_leukotriene_e4 NUMERIC(7,2),
    urine_leukotriene_e4_date DATE,
    chromogranin_a NUMERIC(7,2),
    chromogranin_a_date DATE,
    serum_ige_total NUMERIC(7,2),
    full_blood_count_notes TEXT NOT NULL DEFAULT '',
    bone_marrow_biopsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bone_marrow_biopsy IN ('yes', 'no', '')),
    bone_marrow_biopsy_result TEXT NOT NULL DEFAULT '',
    additional_lab_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_laboratory_results_updated_at
    BEFORE UPDATE ON assessment_laboratory_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_laboratory_results IS
    'Laboratory results section: serum tryptase, histamine, prostaglandins, and other mast cell mediators. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_laboratory_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_laboratory_results.serum_tryptase IS
    'Serum tryptase level in mcg/L.';
COMMENT ON COLUMN assessment_laboratory_results.serum_tryptase_date IS
    'Date the serum tryptase was measured.';
COMMENT ON COLUMN assessment_laboratory_results.serum_tryptase_elevated IS
    'Whether the serum tryptase is elevated above baseline: yes, no, or empty string.';
COMMENT ON COLUMN assessment_laboratory_results.plasma_histamine IS
    'Plasma histamine level in nmol/L.';
COMMENT ON COLUMN assessment_laboratory_results.plasma_histamine_date IS
    'Date the plasma histamine was measured.';
COMMENT ON COLUMN assessment_laboratory_results.urine_n_methylhistamine IS
    'Urine N-methylhistamine level in mcmol/mol creatinine.';
COMMENT ON COLUMN assessment_laboratory_results.urine_n_methylhistamine_date IS
    'Date the urine N-methylhistamine was collected.';
COMMENT ON COLUMN assessment_laboratory_results.urine_prostaglandin_d2 IS
    'Urine prostaglandin D2 metabolite level in ng/mg creatinine.';
COMMENT ON COLUMN assessment_laboratory_results.urine_prostaglandin_d2_date IS
    'Date the urine prostaglandin D2 sample was collected.';
COMMENT ON COLUMN assessment_laboratory_results.urine_leukotriene_e4 IS
    'Urine leukotriene E4 level in pg/mg creatinine.';
COMMENT ON COLUMN assessment_laboratory_results.urine_leukotriene_e4_date IS
    'Date the urine leukotriene E4 sample was collected.';
COMMENT ON COLUMN assessment_laboratory_results.chromogranin_a IS
    'Chromogranin A level in nmol/L.';
COMMENT ON COLUMN assessment_laboratory_results.chromogranin_a_date IS
    'Date the chromogranin A was measured.';
COMMENT ON COLUMN assessment_laboratory_results.serum_ige_total IS
    'Total serum IgE level in kU/L.';
COMMENT ON COLUMN assessment_laboratory_results.full_blood_count_notes IS
    'Free-text notes on full blood count results relevant to MCAS.';
COMMENT ON COLUMN assessment_laboratory_results.bone_marrow_biopsy IS
    'Whether a bone marrow biopsy was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_laboratory_results.bone_marrow_biopsy_result IS
    'Free-text bone marrow biopsy findings.';
COMMENT ON COLUMN assessment_laboratory_results.additional_lab_notes IS
    'Free-text clinician notes on additional laboratory findings.';
