CREATE TABLE grading_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    handicap_level VARCHAR(20) NOT NULL DEFAULT 'no-handicap'
        CHECK (handicap_level IN ('no-handicap', 'mild-moderate', 'significant')),
    hhies_total_score INTEGER NOT NULL DEFAULT 0
        CHECK (hhies_total_score >= 0 AND hhies_total_score <= 40),
    hearing_aid_candidacy VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hearing_aid_candidacy IN ('recommended', 'consider', 'not-indicated', '')),
    left_ear_recommendation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (left_ear_recommendation IN ('hearing-aid', 'medical-referral', 'monitoring', 'no-action', '')),
    right_ear_recommendation VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (right_ear_recommendation IN ('hearing-aid', 'medical-referral', 'monitoring', 'no-action', '')),
    graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_grading_result_updated_at
    BEFORE UPDATE ON grading_result
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE grading_result IS
    'Computed HHIE-S grading result. 0-8 = No handicap, 10-24 = Mild-moderate, 26-40 = Significant. One-to-one child of assessment.';
COMMENT ON COLUMN grading_result.handicap_level IS
    'Hearing handicap classification: no-handicap, mild-moderate, or significant.';
COMMENT ON COLUMN grading_result.hhies_total_score IS
    'Total HHIE-S score (0-40).';
COMMENT ON COLUMN grading_result.hearing_aid_candidacy IS
    'Overall hearing aid candidacy: recommended, consider, not-indicated, or empty string.';
COMMENT ON COLUMN grading_result.left_ear_recommendation IS
    'Left ear recommendation: hearing-aid, medical-referral, monitoring, no-action, or empty string.';
COMMENT ON COLUMN grading_result.right_ear_recommendation IS
    'Right ear recommendation: hearing-aid, medical-referral, monitoring, no-action, or empty string.';
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
