-- ============================================================
-- 04_assessment_blood_count_analysis.sql
-- Step 2: Blood Count Analysis (1:1 with assessment).
-- ============================================================
-- Complete blood count (CBC) results including haemoglobin,
-- haematocrit, RBC, WBC, platelets, MCV, MCH, and RDW.
-- ============================================================

CREATE TABLE assessment_blood_count_analysis (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Blood count fields
    hemoglobin                  NUMERIC(5,1) CHECK (hemoglobin IS NULL OR (hemoglobin >= 0 AND hemoglobin <= 30)),
    hematocrit                  NUMERIC(5,1) CHECK (hematocrit IS NULL OR (hematocrit >= 0 AND hematocrit <= 100)),
    red_blood_cell_count        NUMERIC(5,2) CHECK (red_blood_cell_count IS NULL OR (red_blood_cell_count >= 0 AND red_blood_cell_count <= 15)),
    white_blood_cell_count      NUMERIC(6,1) CHECK (white_blood_cell_count IS NULL OR (white_blood_cell_count >= 0 AND white_blood_cell_count <= 500)),
    platelet_count              NUMERIC(7,1) CHECK (platelet_count IS NULL OR (platelet_count >= 0 AND platelet_count <= 2000)),
    mean_corpuscular_volume     NUMERIC(5,1) CHECK (mean_corpuscular_volume IS NULL OR (mean_corpuscular_volume >= 0 AND mean_corpuscular_volume <= 200)),
    mean_corpuscular_hemoglobin NUMERIC(5,1) CHECK (mean_corpuscular_hemoglobin IS NULL OR (mean_corpuscular_hemoglobin >= 0 AND mean_corpuscular_hemoglobin <= 60)),
    red_cell_distribution_width NUMERIC(5,1) CHECK (red_cell_distribution_width IS NULL OR (red_cell_distribution_width >= 0 AND red_cell_distribution_width <= 40)),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_blood_count_analysis_updated_at
    BEFORE UPDATE ON assessment_blood_count_analysis
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_blood_count_analysis IS
    '1:1 with assessment. Step 2: Blood Count Analysis - CBC results.';
COMMENT ON COLUMN assessment_blood_count_analysis.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_blood_count_analysis.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_blood_count_analysis.hemoglobin IS
    'Haemoglobin concentration in g/dL. Normal: 12.0-17.5 g/dL. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.hematocrit IS
    'Haematocrit percentage. Normal: 36-52%. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.red_blood_cell_count IS
    'Red blood cell count in x10^12/L. Normal: 4.0-6.0. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.white_blood_cell_count IS
    'White blood cell count in x10^9/L. Normal: 4.0-11.0. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.platelet_count IS
    'Platelet count in x10^9/L. Normal: 150-400. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.mean_corpuscular_volume IS
    'Mean corpuscular volume in fL. Normal: 80-100 fL. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.mean_corpuscular_hemoglobin IS
    'Mean corpuscular haemoglobin in pg. Normal: 27-33 pg. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.red_cell_distribution_width IS
    'Red cell distribution width percentage. Normal: 11.5-14.5%. NULL if unanswered.';
COMMENT ON COLUMN assessment_blood_count_analysis.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_blood_count_analysis.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
