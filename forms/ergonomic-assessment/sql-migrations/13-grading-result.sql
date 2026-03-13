-- ============================================================
-- 13_grading_result.sql
-- Stores the computed REBA grading result for an assessment.
-- ============================================================
-- One grading result per assessment. The REBA score is the
-- sum of fired rule scores, clamped to 1-15.
-- ============================================================

CREATE TABLE grading_result (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Computed REBA score (1-15)
    reba_score              INTEGER NOT NULL CHECK (reba_score >= 1 AND reba_score <= 15),

    -- Risk level derived from REBA score
    risk_level              TEXT NOT NULL
                            CHECK (risk_level IN (
                                'Negligible risk', 'Low risk', 'Medium risk',
                                'High risk', 'Very high risk'
                            )),

    -- Optional clinician override
    reba_score_override     INTEGER CHECK (reba_score_override IS NULL OR (reba_score_override >= 1 AND reba_score_override <= 15)),
    override_reason         TEXT NOT NULL DEFAULT '',

    -- When the grading was computed
    graded_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- If override is set, a reason must be provided
    CONSTRAINT chk_override_reason CHECK (
        reba_score_override IS NULL OR override_reason != ''
    )
);

CREATE TRIGGER trg_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed REBA grading result for an assessment. Includes optional clinician override.';
COMMENT ON COLUMN grading_result.reba_score IS
    'Computed REBA score (1-15), sum of fired rule scores clamped to range.';
COMMENT ON COLUMN grading_result.risk_level IS
    'Risk level derived from REBA score: Negligible, Low, Medium, High, or Very high risk.';
COMMENT ON COLUMN grading_result.reba_score_override IS
    'Clinician override of the computed REBA score. NULL if no override.';
COMMENT ON COLUMN grading_result.override_reason IS
    'Required reason text when reba_score_override is set.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the REBA grading was computed.';
