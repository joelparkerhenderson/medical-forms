CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gold_stage VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gold_stage IN ('I', 'II', 'III', 'IV', '')),
    gold_group VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gold_group IN ('A', 'B', 'E', '')),
    fev1_predicted_pct NUMERIC(5,1)
        CHECK (fev1_predicted_pct IS NULL OR (fev1_predicted_pct >= 0 AND fev1_predicted_pct <= 200)),
    symptom_burden VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (symptom_burden IN ('low', 'high', '')),
    exacerbation_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (exacerbation_risk IN ('low', 'high', '')),
    composite_score INTEGER NOT NULL DEFAULT 0
        CHECK (composite_score >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed GOLD (Global Initiative for Chronic Obstructive Lung Disease) staging result. Stage I-IV based on FEV1%, Group A/B/E based on symptoms and exacerbations. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.gold_stage IS
    'GOLD spirometric stage: I (>=80%), II (50-79%), III (30-49%), IV (<30%), or empty.';
COMMENT ON COLUMN grading_result.gold_group IS
    'GOLD group classification (2023 revision): A (low symptoms, low exacerbations), B (high symptoms, low exacerbations), E (exacerbation history), or empty.';
COMMENT ON COLUMN grading_result.fev1_predicted_pct IS
    'Post-bronchodilator FEV1 as percentage of predicted used for staging.';
COMMENT ON COLUMN grading_result.symptom_burden IS
    'Symptom burden classification: low (CAT<10, mMRC 0-1), high (CAT>=10, mMRC>=2), or empty.';
COMMENT ON COLUMN grading_result.exacerbation_risk IS
    'Exacerbation risk: low (0-1 without hospitalisation), high (>=2 or >=1 with hospitalisation), or empty.';
COMMENT ON COLUMN grading_result.composite_score IS
    'Aggregate composite severity score across all domains.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
