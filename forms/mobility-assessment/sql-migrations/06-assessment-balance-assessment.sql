-- 06_assessment_balance_assessment.sql
-- Tinetti Balance Assessment section of the mobility assessment.

CREATE TABLE assessment_balance_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Tinetti Balance items (0-1 or 0-2 scoring per item, total 0-16)
    sitting_balance INTEGER
        CHECK (sitting_balance IS NULL OR (sitting_balance >= 0 AND sitting_balance <= 1)),
    arising_from_chair INTEGER
        CHECK (arising_from_chair IS NULL OR (arising_from_chair >= 0 AND arising_from_chair <= 2)),
    attempts_to_arise INTEGER
        CHECK (attempts_to_arise IS NULL OR (attempts_to_arise >= 0 AND attempts_to_arise <= 2)),
    immediate_standing_balance INTEGER
        CHECK (immediate_standing_balance IS NULL OR (immediate_standing_balance >= 0 AND immediate_standing_balance <= 2)),
    standing_balance INTEGER
        CHECK (standing_balance IS NULL OR (standing_balance >= 0 AND standing_balance <= 2)),
    nudge_test INTEGER
        CHECK (nudge_test IS NULL OR (nudge_test >= 0 AND nudge_test <= 2)),
    eyes_closed INTEGER
        CHECK (eyes_closed IS NULL OR (eyes_closed >= 0 AND eyes_closed <= 1)),
    turning_360 INTEGER
        CHECK (turning_360 IS NULL OR (turning_360 >= 0 AND turning_360 <= 2)),
    sitting_down INTEGER
        CHECK (sitting_down IS NULL OR (sitting_down >= 0 AND sitting_down <= 2)),
    balance_total_score INTEGER
        CHECK (balance_total_score IS NULL OR (balance_total_score >= 0 AND balance_total_score <= 16)),
    balance_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_balance_assessment_updated_at
    BEFORE UPDATE ON assessment_balance_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_balance_assessment IS
    'Tinetti Balance Assessment section: 9 items evaluating sitting balance, standing balance, and postural responses. Total score 0-16. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_balance_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_balance_assessment.sitting_balance IS
    'Sitting balance: 0 = leans/slides, 1 = steady/safe (0-1).';
COMMENT ON COLUMN assessment_balance_assessment.arising_from_chair IS
    'Arising from chair: 0 = unable without help, 1 = able with arms, 2 = able without arms (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.attempts_to_arise IS
    'Attempts to arise: 0 = unable without help, 1 = able but needs >1 attempt, 2 = able on first attempt (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.immediate_standing_balance IS
    'Immediate standing balance (first 5 seconds): 0 = unsteady, 1 = steady with walker/support, 2 = steady without support (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.standing_balance IS
    'Standing balance: 0 = unsteady, 1 = steady with wide stance or support, 2 = narrow stance without support (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.nudge_test IS
    'Nudge test (gentle push on sternum): 0 = begins to fall, 1 = staggers/grabs, 2 = steady (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.eyes_closed IS
    'Eyes closed standing: 0 = unsteady, 1 = steady (0-1).';
COMMENT ON COLUMN assessment_balance_assessment.turning_360 IS
    'Turning 360 degrees: 0 = discontinuous steps or unsteady, 1 = continuous steps or mild unsteadiness, 2 = steady continuous steps (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.sitting_down IS
    'Sitting down: 0 = unsafe or misjudges distance, 1 = uses arms or not smooth, 2 = safe smooth motion (0-2).';
COMMENT ON COLUMN assessment_balance_assessment.balance_total_score IS
    'Tinetti Balance total score (sum of 9 items, range 0-16).';
COMMENT ON COLUMN assessment_balance_assessment.balance_notes IS
    'Free-text clinician observations on balance assessment.';
