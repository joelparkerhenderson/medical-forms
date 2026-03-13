-- 08_assessment_laboratory_results.sql
-- Laboratory results section of the prenatal assessment.

CREATE TABLE assessment_laboratory_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    haemoglobin_gdl NUMERIC(4,1)
        CHECK (haemoglobin_gdl IS NULL OR (haemoglobin_gdl >= 3.0 AND haemoglobin_gdl <= 25.0)),
    haematocrit_pct NUMERIC(4,1)
        CHECK (haematocrit_pct IS NULL OR (haematocrit_pct >= 10.0 AND haematocrit_pct <= 70.0)),
    platelet_count INTEGER
        CHECK (platelet_count IS NULL OR platelet_count >= 0),
    white_blood_cell_count NUMERIC(5,1)
        CHECK (white_blood_cell_count IS NULL OR white_blood_cell_count >= 0),
    blood_glucose_mmol NUMERIC(5,1)
        CHECK (blood_glucose_mmol IS NULL OR blood_glucose_mmol >= 0),
    hba1c_pct NUMERIC(4,1)
        CHECK (hba1c_pct IS NULL OR hba1c_pct >= 0),
    gtt_result VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (gtt_result IN ('normal', 'abnormal', 'not-done', '')),
    ferritin_ngml NUMERIC(6,1)
        CHECK (ferritin_ngml IS NULL OR ferritin_ngml >= 0),
    thyroid_tsh NUMERIC(6,2)
        CHECK (thyroid_tsh IS NULL OR thyroid_tsh >= 0),
    hiv_screening VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hiv_screening IN ('negative', 'positive', 'declined', 'not-done', '')),
    hepatitis_b VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hepatitis_b IN ('negative', 'positive', 'immune', 'not-done', '')),
    hepatitis_c VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (hepatitis_c IN ('negative', 'positive', 'not-done', '')),
    syphilis_screening VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (syphilis_screening IN ('negative', 'positive', 'not-done', '')),
    rubella_immunity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (rubella_immunity IN ('immune', 'non-immune', 'not-done', '')),
    group_b_strep VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (group_b_strep IN ('negative', 'positive', 'not-done', '')),
    urine_culture VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (urine_culture IN ('negative', 'positive', 'not-done', '')),
    urine_culture_organism TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_laboratory_results_updated_at
    BEFORE UPDATE ON assessment_laboratory_results
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_laboratory_results IS
    'Laboratory results section: haematology, biochemistry, glucose tolerance, infection screening, and urine cultures. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_laboratory_results.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_laboratory_results.haemoglobin_gdl IS
    'Haemoglobin concentration in g/dL.';
COMMENT ON COLUMN assessment_laboratory_results.haematocrit_pct IS
    'Haematocrit percentage.';
COMMENT ON COLUMN assessment_laboratory_results.platelet_count IS
    'Platelet count (x10^9/L).';
COMMENT ON COLUMN assessment_laboratory_results.white_blood_cell_count IS
    'White blood cell count (x10^9/L).';
COMMENT ON COLUMN assessment_laboratory_results.blood_glucose_mmol IS
    'Blood glucose in mmol/L.';
COMMENT ON COLUMN assessment_laboratory_results.hba1c_pct IS
    'HbA1c (glycated haemoglobin) percentage.';
COMMENT ON COLUMN assessment_laboratory_results.gtt_result IS
    'Glucose tolerance test result: normal, abnormal, not-done, or empty.';
COMMENT ON COLUMN assessment_laboratory_results.ferritin_ngml IS
    'Serum ferritin in ng/mL.';
COMMENT ON COLUMN assessment_laboratory_results.thyroid_tsh IS
    'Thyroid-stimulating hormone in mIU/L.';
COMMENT ON COLUMN assessment_laboratory_results.hiv_screening IS
    'HIV screening result: negative, positive, declined, not-done, or empty.';
COMMENT ON COLUMN assessment_laboratory_results.hepatitis_b IS
    'Hepatitis B surface antigen result: negative, positive, immune, not-done, or empty.';
COMMENT ON COLUMN assessment_laboratory_results.syphilis_screening IS
    'Syphilis screening result: negative, positive, not-done, or empty.';
COMMENT ON COLUMN assessment_laboratory_results.rubella_immunity IS
    'Rubella immunity status: immune, non-immune, not-done, or empty.';
COMMENT ON COLUMN assessment_laboratory_results.group_b_strep IS
    'Group B Streptococcus screening result: negative, positive, not-done, or empty.';
