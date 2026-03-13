-- 09_assessment_laboratory_results.sql
-- Laboratory results section of the oncology assessment.

CREATE TABLE assessment_laboratory_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    lab_date DATE,
    haemoglobin NUMERIC(5,1)
        CHECK (haemoglobin IS NULL OR haemoglobin >= 0),
    white_cell_count NUMERIC(5,2)
        CHECK (white_cell_count IS NULL OR white_cell_count >= 0),
    neutrophil_count NUMERIC(5,2)
        CHECK (neutrophil_count IS NULL OR neutrophil_count >= 0),
    platelet_count INTEGER
        CHECK (platelet_count IS NULL OR platelet_count >= 0),
    creatinine NUMERIC(6,1)
        CHECK (creatinine IS NULL OR creatinine >= 0),
    egfr NUMERIC(6,1)
        CHECK (egfr IS NULL OR egfr >= 0),
    bilirubin NUMERIC(5,1)
        CHECK (bilirubin IS NULL OR bilirubin >= 0),
    alt NUMERIC(6,1)
        CHECK (alt IS NULL OR alt >= 0),
    ast NUMERIC(6,1)
        CHECK (ast IS NULL OR ast >= 0),
    alkaline_phosphatase NUMERIC(6,1)
        CHECK (alkaline_phosphatase IS NULL OR alkaline_phosphatase >= 0),
    albumin NUMERIC(4,1)
        CHECK (albumin IS NULL OR albumin >= 0),
    ldh NUMERIC(6,1)
        CHECK (ldh IS NULL OR ldh >= 0),
    tumour_markers TEXT NOT NULL DEFAULT '',
    other_results TEXT NOT NULL DEFAULT '',
    laboratory_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_laboratory_results_updated_at
    BEFORE UPDATE ON assessment_laboratory_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_laboratory_results IS
    'Laboratory results section: haematology, renal function, liver function, and tumour markers. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_laboratory_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_laboratory_results.lab_date IS
    'Date when the laboratory tests were performed.';
COMMENT ON COLUMN assessment_laboratory_results.haemoglobin IS
    'Haemoglobin level in g/L.';
COMMENT ON COLUMN assessment_laboratory_results.white_cell_count IS
    'White blood cell count in x10^9/L.';
COMMENT ON COLUMN assessment_laboratory_results.neutrophil_count IS
    'Absolute neutrophil count in x10^9/L.';
COMMENT ON COLUMN assessment_laboratory_results.platelet_count IS
    'Platelet count in x10^9/L.';
COMMENT ON COLUMN assessment_laboratory_results.creatinine IS
    'Serum creatinine in umol/L.';
COMMENT ON COLUMN assessment_laboratory_results.egfr IS
    'Estimated glomerular filtration rate in mL/min/1.73m2.';
COMMENT ON COLUMN assessment_laboratory_results.bilirubin IS
    'Total bilirubin in umol/L.';
COMMENT ON COLUMN assessment_laboratory_results.alt IS
    'Alanine aminotransferase in U/L.';
COMMENT ON COLUMN assessment_laboratory_results.ast IS
    'Aspartate aminotransferase in U/L.';
COMMENT ON COLUMN assessment_laboratory_results.alkaline_phosphatase IS
    'Alkaline phosphatase in U/L.';
COMMENT ON COLUMN assessment_laboratory_results.albumin IS
    'Serum albumin in g/L.';
COMMENT ON COLUMN assessment_laboratory_results.ldh IS
    'Lactate dehydrogenase in U/L.';
COMMENT ON COLUMN assessment_laboratory_results.tumour_markers IS
    'Relevant tumour marker results (e.g. CEA, CA-125, PSA, AFP).';
COMMENT ON COLUMN assessment_laboratory_results.other_results IS
    'Other relevant laboratory results not listed above.';
COMMENT ON COLUMN assessment_laboratory_results.laboratory_notes IS
    'Additional clinician notes on laboratory results.';
