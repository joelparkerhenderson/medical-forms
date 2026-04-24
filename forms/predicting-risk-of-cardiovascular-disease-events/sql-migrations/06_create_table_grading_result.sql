CREATE TABLE grading_result (
    -- Primary key
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Risk category determined by 10-year risk percentage
    risk_category               TEXT NOT NULL
                                CHECK (risk_category IN ('draft', 'low', 'borderline', 'intermediate', 'high')),

    -- Computed risk estimates
    ten_year_risk_percent       NUMERIC(4,1) NOT NULL CHECK (ten_year_risk_percent >= 0 AND ten_year_risk_percent <= 95),
    thirty_year_risk_percent    NUMERIC(4,1) NOT NULL CHECK (thirty_year_risk_percent >= 0 AND thirty_year_risk_percent <= 95),

    -- Clinician override: when clinical judgement differs from computed category
    risk_category_override      TEXT CHECK (risk_category_override IS NULL OR risk_category_override IN ('low', 'borderline', 'intermediate', 'high')),
    override_reason             TEXT NOT NULL DEFAULT ''
                                CHECK (risk_category_override IS NULL OR override_reason != ''),

    -- Timestamp of when the grading engine ran
    graded_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Audit timestamps
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    '1:1 with assessment. Stores computed PREVENT risk category, 10-year and 30-year risk percentages, and optional clinician override.';
COMMENT ON COLUMN grading_result.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN grading_result.risk_category IS
    'Computed risk category: draft (insufficient data), low (<5%), borderline (5-7.4%), intermediate (7.5-19.9%), high (>=20%).';
COMMENT ON COLUMN grading_result.ten_year_risk_percent IS
    'Estimated 10-year CVD risk percentage (0.0-95.0).';
COMMENT ON COLUMN grading_result.thirty_year_risk_percent IS
    'Estimated 30-year CVD risk percentage (0.0-95.0). Calculated as 10-year risk * 2.5, capped at 95%.';
COMMENT ON COLUMN grading_result.risk_category_override IS
    'Clinician-assigned risk category override. NULL means no override.';
COMMENT ON COLUMN grading_result.override_reason IS
    'Free-text justification for overriding the computed risk category. Required when override is set.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading engine produced this result.';
COMMENT ON COLUMN grading_result.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
