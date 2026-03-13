-- 08_assessment_laboratory_results.sql
-- Laboratory results section of the rheumatology assessment.

CREATE TABLE assessment_laboratory_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Inflammatory markers (DAS28 components)
    esr_mm_hr NUMERIC(5,1)
        CHECK (esr_mm_hr IS NULL OR esr_mm_hr >= 0),
    crp_mg_l NUMERIC(6,2)
        CHECK (crp_mg_l IS NULL OR crp_mg_l >= 0),

    -- Serology
    rheumatoid_factor_iu_ml NUMERIC(7,1)
        CHECK (rheumatoid_factor_iu_ml IS NULL OR rheumatoid_factor_iu_ml >= 0),
    anti_ccp_u_ml NUMERIC(7,1)
        CHECK (anti_ccp_u_ml IS NULL OR anti_ccp_u_ml >= 0),
    ana_positive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ana_positive IN ('yes', 'no', '')),
    ana_titre VARCHAR(20) NOT NULL DEFAULT '',

    -- Haematology
    haemoglobin_g_dl NUMERIC(4,1)
        CHECK (haemoglobin_g_dl IS NULL OR haemoglobin_g_dl >= 0),
    white_cell_count NUMERIC(5,1)
        CHECK (white_cell_count IS NULL OR white_cell_count >= 0),
    platelet_count INTEGER
        CHECK (platelet_count IS NULL OR platelet_count >= 0),

    -- Renal and hepatic
    creatinine_umol_l NUMERIC(6,1)
        CHECK (creatinine_umol_l IS NULL OR creatinine_umol_l >= 0),
    alt_u_l NUMERIC(6,1)
        CHECK (alt_u_l IS NULL OR alt_u_l >= 0),

    lab_date DATE,
    additional_results TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_laboratory_results_updated_at
    BEFORE UPDATE ON assessment_laboratory_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_laboratory_results IS
    'Laboratory results section: inflammatory markers, serology, haematology, and organ function. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_laboratory_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_laboratory_results.esr_mm_hr IS
    'Erythrocyte sedimentation rate in mm/hr; DAS28 component.';
COMMENT ON COLUMN assessment_laboratory_results.crp_mg_l IS
    'C-reactive protein in mg/L; alternative DAS28 component (DAS28-CRP).';
COMMENT ON COLUMN assessment_laboratory_results.rheumatoid_factor_iu_ml IS
    'Rheumatoid factor titre in IU/mL.';
COMMENT ON COLUMN assessment_laboratory_results.anti_ccp_u_ml IS
    'Anti-cyclic citrullinated peptide antibody level in U/mL.';
COMMENT ON COLUMN assessment_laboratory_results.ana_positive IS
    'Whether antinuclear antibody (ANA) is positive.';
COMMENT ON COLUMN assessment_laboratory_results.ana_titre IS
    'ANA titre if positive (e.g. 1:80, 1:160).';
COMMENT ON COLUMN assessment_laboratory_results.haemoglobin_g_dl IS
    'Haemoglobin level in g/dL.';
COMMENT ON COLUMN assessment_laboratory_results.white_cell_count IS
    'White blood cell count in 10^9/L.';
COMMENT ON COLUMN assessment_laboratory_results.platelet_count IS
    'Platelet count in 10^9/L.';
COMMENT ON COLUMN assessment_laboratory_results.creatinine_umol_l IS
    'Serum creatinine in umol/L for renal function monitoring.';
COMMENT ON COLUMN assessment_laboratory_results.alt_u_l IS
    'Alanine aminotransferase in U/L for hepatic function monitoring.';
COMMENT ON COLUMN assessment_laboratory_results.lab_date IS
    'Date when laboratory tests were performed.';
COMMENT ON COLUMN assessment_laboratory_results.additional_results IS
    'Free-text additional laboratory results.';
