-- 13_grading_result.sql
-- Stores the computed UK MEC grading result for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mec_category_coc VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mec_category_coc IN ('1', '2', '3', '4', '')),
    mec_category_pop VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mec_category_pop IN ('1', '2', '3', '4', '')),
    mec_category_implant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mec_category_implant IN ('1', '2', '3', '4', '')),
    mec_category_injection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mec_category_injection IN ('1', '2', '3', '4', '')),
    mec_category_iud VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mec_category_iud IN ('1', '2', '3', '4', '')),
    mec_category_ius VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mec_category_ius IN ('1', '2', '3', '4', '')),
    overall_risk_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (overall_risk_level IN ('low', 'moderate', 'high', 'critical', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed UK MEC grading result. MEC categories 1-4 per contraceptive method. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.mec_category_coc IS
    'UK MEC category for combined oral contraception: 1, 2, 3, 4, or empty.';
COMMENT ON COLUMN grading_result.mec_category_pop IS
    'UK MEC category for progestogen-only pill: 1, 2, 3, 4, or empty.';
COMMENT ON COLUMN grading_result.mec_category_implant IS
    'UK MEC category for contraceptive implant: 1, 2, 3, 4, or empty.';
COMMENT ON COLUMN grading_result.mec_category_injection IS
    'UK MEC category for injectable contraception: 1, 2, 3, 4, or empty.';
COMMENT ON COLUMN grading_result.mec_category_iud IS
    'UK MEC category for copper IUD: 1, 2, 3, 4, or empty.';
COMMENT ON COLUMN grading_result.mec_category_ius IS
    'UK MEC category for hormonal IUS: 1, 2, 3, 4, or empty.';
COMMENT ON COLUMN grading_result.overall_risk_level IS
    'Overall risk level based on worst MEC category: low, moderate, high, critical, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
