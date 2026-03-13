-- ============================================================
-- 08_assessment_hemoglobinopathy_screening.sql
-- Step 6: Hemoglobinopathy Screening (1:1 with assessment).
-- ============================================================
-- Screening results for haemoglobin disorders including sickle
-- cell, thalassemia, electrophoresis, and HPLC.
-- ============================================================

CREATE TABLE assessment_hemoglobinopathy_screening (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Hemoglobinopathy screening fields
    hemoglobin_electrophoresis  TEXT NOT NULL DEFAULT '',
    sickle_cell_screen          TEXT NOT NULL DEFAULT ''
                                CHECK (sickle_cell_screen IN ('positive', 'negative', 'not-performed', '')),
    thalassemia_screen          TEXT NOT NULL DEFAULT ''
                                CHECK (thalassemia_screen IN ('positive', 'negative', 'not-performed', '')),
    hplc_results                TEXT NOT NULL DEFAULT '',
    genetic_testing_notes       TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_hemoglobinopathy_screening_updated_at
    BEFORE UPDATE ON assessment_hemoglobinopathy_screening
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_hemoglobinopathy_screening IS
    '1:1 with assessment. Step 6: Hemoglobinopathy Screening - sickle cell, thalassemia, electrophoresis, HPLC.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.hemoglobin_electrophoresis IS
    'Haemoglobin electrophoresis results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.sickle_cell_screen IS
    'Sickle cell screen result: positive, negative, not-performed, or empty string.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.thalassemia_screen IS
    'Thalassemia screen result: positive, negative, not-performed, or empty string.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.hplc_results IS
    'High-performance liquid chromatography results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.genetic_testing_notes IS
    'Genetic testing notes and results. Empty string if unanswered.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_hemoglobinopathy_screening.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
