-- 13_grading_result.sql
-- Stores the computed GAF (Global Assessment of Functioning) score for an assessment.

CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gaf_score INTEGER NOT NULL DEFAULT 0
        CHECK (gaf_score >= 1 AND gaf_score <= 100),
    gaf_category VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (gaf_category IN (
            'superior-functioning',
            'absent-minimal-symptoms',
            'transient-symptoms',
            'mild-symptoms',
            'moderate-symptoms',
            'serious-symptoms',
            'impaired-reality-testing',
            'behaviour-influenced-by-delusions',
            'danger-of-hurting-self-others',
            'persistent-danger',
            ''
        )),
    symptom_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (symptom_severity IN ('minimal', 'mild', 'moderate', 'severe', 'extreme', '')),
    functional_impairment VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (functional_impairment IN ('minimal', 'mild', 'moderate', 'severe', 'extreme', '')),
    risk_classification VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (risk_classification IN ('low', 'moderate', 'high', 'imminent', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed GAF (Global Assessment of Functioning) score. Range 1-100, with higher scores indicating better functioning. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN grading_result.gaf_score IS
    'GAF score (1-100): 91-100 superior functioning, 51-60 moderate symptoms, 1-10 persistent danger.';
COMMENT ON COLUMN grading_result.gaf_category IS
    'GAF descriptive category corresponding to the score decile.';
COMMENT ON COLUMN grading_result.symptom_severity IS
    'Overall symptom severity: minimal, mild, moderate, severe, extreme, or empty.';
COMMENT ON COLUMN grading_result.functional_impairment IS
    'Overall functional impairment level: minimal, mild, moderate, severe, extreme, or empty.';
COMMENT ON COLUMN grading_result.risk_classification IS
    'Overall risk classification: low, moderate, high, imminent, or empty.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading was computed.';
