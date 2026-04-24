CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    asa_class VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (asa_class IN ('I', 'II', 'III', 'IV', 'V', '')),
    wound_class VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wound_class IN ('clean', 'clean-contaminated', 'contaminated', 'dirty', '')),
    complexity_score VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (complexity_score IN ('1', '2', '3', '4', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed plastic surgery grading result. ASA Class I-V, Wound Classification, and Surgical Complexity. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.asa_class IS
    'ASA Physical Status Classification: I, II, III, IV, V, or empty.';
COMMENT ON COLUMN grading_result.wound_class IS
    'CDC Wound Classification: clean, clean-contaminated, contaminated, dirty, or empty.';
COMMENT ON COLUMN grading_result.complexity_score IS
    'Surgical complexity score: 1 (minor), 2 (intermediate), 3 (major), 4 (major plus/emergency), or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall surgical risk level: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
