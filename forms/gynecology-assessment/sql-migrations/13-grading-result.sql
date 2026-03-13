-- 13_grading_result.sql
-- Stores the computed symptom severity grading result for a gynaecology assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    severity_level VARCHAR(10) NOT NULL DEFAULT 'mild'
        CHECK (severity_level IN ('mild', 'moderate', 'severe')),
    total_symptom_score INTEGER NOT NULL DEFAULT 0
        CHECK (total_symptom_score >= 0),
    menstrual_domain_score INTEGER NOT NULL DEFAULT 0
        CHECK (menstrual_domain_score >= 0),
    pelvic_symptom_score INTEGER NOT NULL DEFAULT 0
        CHECK (pelvic_symptom_score >= 0),
    urogenital_symptom_score INTEGER NOT NULL DEFAULT 0
        CHECK (urogenital_symptom_score >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed gynaecological symptom severity result based on frequency, intensity, and clinical significance. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.severity_level IS
    'Overall severity classification: mild, moderate, or severe.';
COMMENT ON COLUMN grading_result.total_symptom_score IS
    'Composite symptom severity score across all domains.';
COMMENT ON COLUMN grading_result.menstrual_domain_score IS
    'Sub-score for menstrual symptoms.';
COMMENT ON COLUMN grading_result.pelvic_symptom_score IS
    'Sub-score for pelvic pain and prolapse symptoms.';
COMMENT ON COLUMN grading_result.urogenital_symptom_score IS
    'Sub-score for urogenital and vulval symptoms.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
