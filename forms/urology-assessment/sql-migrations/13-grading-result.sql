-- 13_grading_result.sql
-- Stores the computed IPSS grading result for a urology assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    ipss_total_score INTEGER
        CHECK (ipss_total_score IS NULL OR (ipss_total_score >= 0 AND ipss_total_score <= 35)),
    ipss_qol_score INTEGER
        CHECK (ipss_qol_score IS NULL OR (ipss_qol_score >= 0 AND ipss_qol_score <= 6)),
    symptom_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (symptom_severity IN ('mild', 'moderate', 'severe', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed IPSS prostate symptom grading result. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.ipss_total_score IS
    'IPSS total score (0-35); 0-7 mild, 8-19 moderate, 20-35 severe.';
COMMENT ON COLUMN grading_result.ipss_qol_score IS
    'IPSS quality of life bother score (0-6).';
COMMENT ON COLUMN grading_result.symptom_severity IS
    'Symptom severity category: mild (0-7), moderate (8-19), severe (20-35), or empty string if not yet graded.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
