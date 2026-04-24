CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cfs_score INTEGER NOT NULL DEFAULT 1
        CHECK (cfs_score >= 1 AND cfs_score <= 9),
    cfs_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (cfs_category IN ('very-fit', 'well', 'managing-well', 'vulnerable', 'mildly-frail', 'moderately-frail', 'severely-frail', 'very-severely-frail', 'terminally-ill', '')),
    functional_domain_score INTEGER
        CHECK (functional_domain_score IS NULL OR functional_domain_score >= 0),
    cognitive_domain_score INTEGER
        CHECK (cognitive_domain_score IS NULL OR cognitive_domain_score >= 0),
    mobility_domain_score INTEGER
        CHECK (mobility_domain_score IS NULL OR mobility_domain_score >= 0),
    nutrition_domain_score INTEGER
        CHECK (nutrition_domain_score IS NULL OR nutrition_domain_score >= 0),
    polypharmacy_domain_score INTEGER
        CHECK (polypharmacy_domain_score IS NULL OR polypharmacy_domain_score >= 0),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed Clinical Frailty Scale result. CFS 1 = Very fit, 4 = Vulnerable, 7 = Severely frail, 9 = Terminally ill. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.cfs_score IS
    'Clinical Frailty Scale score (1-9).';
COMMENT ON COLUMN grading_result.cfs_category IS
    'CFS category: very-fit, well, managing-well, vulnerable, mildly-frail, moderately-frail, severely-frail, very-severely-frail, terminally-ill, or empty string.';
COMMENT ON COLUMN grading_result.functional_domain_score IS
    'Sub-score for the functional assessment domain, NULL if not yet scored.';
COMMENT ON COLUMN grading_result.cognitive_domain_score IS
    'Sub-score for the cognitive screening domain, NULL if not yet scored.';
COMMENT ON COLUMN grading_result.mobility_domain_score IS
    'Sub-score for the mobility and falls domain, NULL if not yet scored.';
COMMENT ON COLUMN grading_result.nutrition_domain_score IS
    'Sub-score for the nutrition domain, NULL if not yet scored.';
COMMENT ON COLUMN grading_result.polypharmacy_domain_score IS
    'Sub-score for the polypharmacy review domain, NULL if not yet scored.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';

COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was last updated.';
