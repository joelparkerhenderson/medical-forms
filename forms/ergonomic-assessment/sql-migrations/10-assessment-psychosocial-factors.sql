-- ============================================================
-- 10_assessment_psychosocial_factors.sql
-- Psychosocial and work environment factors (1:1).
-- ============================================================

CREATE TABLE assessment_psychosocial_factors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    job_satisfaction     TEXT NOT NULL DEFAULT ''
                        CHECK (job_satisfaction IN ('very-satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very-dissatisfied', '')),
    workload            TEXT NOT NULL DEFAULT ''
                        CHECK (workload IN ('manageable', 'slightly-heavy', 'heavy', 'excessive', '')),
    stress_level        TEXT NOT NULL DEFAULT ''
                        CHECK (stress_level IN ('low', 'moderate', 'high', 'very-high', '')),
    breaks_taken        TEXT NOT NULL DEFAULT ''
                        CHECK (breaks_taken IN ('regular', 'occasional', 'rarely', 'none', '')),
    autonomy            TEXT NOT NULL DEFAULT ''
                        CHECK (autonomy IN ('high', 'moderate', 'low', 'none', '')),
    employer_support    TEXT NOT NULL DEFAULT ''
                        CHECK (employer_support IN ('excellent', 'good', 'fair', 'poor', '')),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_psychosocial_factors_updated_at
    BEFORE UPDATE ON assessment_psychosocial_factors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_psychosocial_factors IS
    'Psychosocial factors: job satisfaction, workload, stress, breaks, autonomy, employer support.';
COMMENT ON COLUMN assessment_psychosocial_factors.job_satisfaction IS
    'Job satisfaction level: very-satisfied through very-dissatisfied, or empty.';
COMMENT ON COLUMN assessment_psychosocial_factors.workload IS
    'Perceived workload: manageable, slightly-heavy, heavy, excessive, or empty.';
COMMENT ON COLUMN assessment_psychosocial_factors.stress_level IS
    'Self-reported stress level: low, moderate, high, very-high, or empty.';
COMMENT ON COLUMN assessment_psychosocial_factors.breaks_taken IS
    'Frequency of breaks: regular, occasional, rarely, none, or empty.';
COMMENT ON COLUMN assessment_psychosocial_factors.autonomy IS
    'Level of work autonomy: high, moderate, low, none, or empty.';
COMMENT ON COLUMN assessment_psychosocial_factors.employer_support IS
    'Perceived employer support: excellent, good, fair, poor, or empty.';
