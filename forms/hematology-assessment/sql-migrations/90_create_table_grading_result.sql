CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    -- 1:1 relationship with assessment
    assessment_id               UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,
    -- Abnormality classification
    abnormality_level           TEXT NOT NULL
                                CHECK (abnormality_level IN ('draft', 'normal', 'mildAbnormality', 'moderateAbnormality', 'severeAbnormality', 'critical')),
    -- Computed abnormality score (0-100 percentage)
    abnormality_score           NUMERIC(5,1) NOT NULL CHECK (abnormality_score >= 0 AND abnormality_score <= 100),
    -- Clinician override: when clinical judgement differs from computed level
    abnormality_level_override  TEXT CHECK (abnormality_level_override IS NULL OR abnormality_level_override IN ('normal', 'mildAbnormality', 'moderateAbnormality', 'severeAbnormality', 'critical')),
    override_reason             TEXT NOT NULL DEFAULT ''
                                CHECK (abnormality_level_override IS NULL OR override_reason != ''),
    -- Timestamp of when the grading engine ran
    graded_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    '1:1 with assessment. Stores computed hematology abnormality level, score, and optional clinician override.';
COMMENT ON COLUMN grading_result.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN grading_result.abnormality_level IS
    'Computed abnormality level: draft (insufficient data), normal (0%), mildAbnormality (1-20%), moderateAbnormality (21-50%), severeAbnormality (51-75%), critical (76-100%).';
COMMENT ON COLUMN grading_result.abnormality_score IS
    'Composite abnormality score as percentage (0.0-100.0).';
COMMENT ON COLUMN grading_result.abnormality_level_override IS
    'Clinician-assigned abnormality level override. NULL means no override.';
COMMENT ON COLUMN grading_result.override_reason IS
    'Free-text justification for overriding the computed level. Required when override is set.';
COMMENT ON COLUMN grading_result.graded_at IS
    'Timestamp when the grading engine produced this result.';
COMMENT ON COLUMN grading_result.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN grading_result.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN grading_result.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN grading_result.deleted_at IS
    'Timestamp when this row was deleted.';
