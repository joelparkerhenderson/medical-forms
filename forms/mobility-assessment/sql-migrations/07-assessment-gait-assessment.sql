-- 07_assessment_gait_assessment.sql
-- Tinetti Gait Assessment section of the mobility assessment.

CREATE TABLE assessment_gait_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- Tinetti Gait items (0-1 scoring per item, total 0-12)
    initiation_of_gait INTEGER
        CHECK (initiation_of_gait IS NULL OR (initiation_of_gait >= 0 AND initiation_of_gait <= 1)),
    step_length_right INTEGER
        CHECK (step_length_right IS NULL OR (step_length_right >= 0 AND step_length_right <= 1)),
    step_length_left INTEGER
        CHECK (step_length_left IS NULL OR (step_length_left >= 0 AND step_length_left <= 1)),
    step_height_right INTEGER
        CHECK (step_height_right IS NULL OR (step_height_right >= 0 AND step_height_right <= 1)),
    step_height_left INTEGER
        CHECK (step_height_left IS NULL OR (step_height_left >= 0 AND step_height_left <= 1)),
    step_symmetry INTEGER
        CHECK (step_symmetry IS NULL OR (step_symmetry >= 0 AND step_symmetry <= 1)),
    step_continuity INTEGER
        CHECK (step_continuity IS NULL OR (step_continuity >= 0 AND step_continuity <= 1)),
    path_deviation INTEGER
        CHECK (path_deviation IS NULL OR (path_deviation >= 0 AND path_deviation <= 2)),
    trunk_sway INTEGER
        CHECK (trunk_sway IS NULL OR (trunk_sway >= 0 AND trunk_sway <= 2)),
    walking_stance INTEGER
        CHECK (walking_stance IS NULL OR (walking_stance >= 0 AND walking_stance <= 1)),
    gait_total_score INTEGER
        CHECK (gait_total_score IS NULL OR (gait_total_score >= 0 AND gait_total_score <= 12)),
    gait_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_gait_assessment_updated_at
    BEFORE UPDATE ON assessment_gait_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_gait_assessment IS
    'Tinetti Gait Assessment section: 10 items evaluating gait initiation, step characteristics, path, and trunk control. Total score 0-12. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_gait_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_gait_assessment.initiation_of_gait IS
    'Initiation of gait: 0 = any hesitancy or multiple attempts, 1 = no hesitancy (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.step_length_right IS
    'Right step length: 0 = does not pass left stance foot, 1 = passes left stance foot (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.step_length_left IS
    'Left step length: 0 = does not pass right stance foot, 1 = passes right stance foot (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.step_height_right IS
    'Right step height (foot clearance): 0 = foot not completely off floor, 1 = foot completely off floor (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.step_height_left IS
    'Left step height (foot clearance): 0 = foot not completely off floor, 1 = foot completely off floor (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.step_symmetry IS
    'Step symmetry: 0 = right and left step length unequal, 1 = equal (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.step_continuity IS
    'Step continuity: 0 = stopping or discontinuity between steps, 1 = steps appear continuous (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.path_deviation IS
    'Path deviation: 0 = marked deviation, 1 = mild/moderate deviation or uses walking aid, 2 = straight without aid (0-2).';
COMMENT ON COLUMN assessment_gait_assessment.trunk_sway IS
    'Trunk sway: 0 = marked sway or uses walking aid, 1 = no sway but flexion of knees/back or uses arms, 2 = no sway or flexion (0-2).';
COMMENT ON COLUMN assessment_gait_assessment.walking_stance IS
    'Walking stance: 0 = heels apart, 1 = heels almost touching while walking (0-1).';
COMMENT ON COLUMN assessment_gait_assessment.gait_total_score IS
    'Tinetti Gait total score (sum of 10 items, range 0-12).';
COMMENT ON COLUMN assessment_gait_assessment.gait_notes IS
    'Free-text clinician observations on gait assessment.';
