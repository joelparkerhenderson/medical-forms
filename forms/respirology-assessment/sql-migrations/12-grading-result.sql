-- 12_grading_result.sql
-- Stores the computed MRC Dyspnoea Scale result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mrc_grade INTEGER NOT NULL DEFAULT 1
        CHECK (mrc_grade >= 1 AND mrc_grade <= 5),
    mrc_description VARCHAR(100) NOT NULL DEFAULT '',
    overall_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_severity IN ('mild', 'moderate', 'severe', 'very-severe', '')),
    functional_impairment VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (functional_impairment IN ('minimal', 'mild', 'moderate', 'severe', '')),
    composite_score INTEGER NOT NULL DEFAULT 0
        CHECK (composite_score >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed MRC (Medical Research Council) Dyspnoea Scale result. Grade 1-5, with higher grades indicating worse breathlessness. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.mrc_grade IS
    'MRC dyspnoea grade: 1=strenuous exercise only, 2=hurrying on flat, 3=slower than peers, 4=stops after 100m, 5=too breathless to leave house.';
COMMENT ON COLUMN grading_result.mrc_description IS
    'Human-readable description of the MRC dyspnoea grade.';
COMMENT ON COLUMN grading_result.overall_severity IS
    'Overall respiratory disease severity: mild, moderate, severe, very-severe, or empty.';
COMMENT ON COLUMN grading_result.functional_impairment IS
    'Overall functional impairment: minimal, mild, moderate, severe, or empty.';
COMMENT ON COLUMN grading_result.composite_score IS
    'Aggregate composite score across all respiratory domains.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
