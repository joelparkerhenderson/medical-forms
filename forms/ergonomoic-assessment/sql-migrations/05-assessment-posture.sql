-- 05_assessment_posture.sql
-- Step 3: Posture assessment section (REBA body posture scoring).

CREATE TABLE assessment_posture (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- REBA Group A: Trunk, Neck, Legs
    trunk_position VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (trunk_position IN ('neutral', 'flexed_0_20', 'flexed_20_60', 'flexed_over_60', 'extended', '')),
    trunk_score INTEGER
        CHECK (trunk_score IS NULL OR trunk_score BETWEEN 1 AND 5),
    trunk_side_bent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trunk_side_bent IN ('yes', 'no', '')),
    trunk_twisted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (trunk_twisted IN ('yes', 'no', '')),
    neck_position VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (neck_position IN ('flexed_0_20', 'flexed_over_20', 'extended', '')),
    neck_score INTEGER
        CHECK (neck_score IS NULL OR neck_score BETWEEN 1 AND 3),
    neck_side_bent VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neck_side_bent IN ('yes', 'no', '')),
    neck_twisted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (neck_twisted IN ('yes', 'no', '')),
    leg_position VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (leg_position IN ('bilateral_weight_bearing', 'unilateral_weight_bearing', '')),
    leg_score INTEGER
        CHECK (leg_score IS NULL OR leg_score BETWEEN 1 AND 4),
    knee_flexion VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (knee_flexion IN ('flexed_30_60', 'flexed_over_60', 'none', '')),

    -- REBA Group B: Upper Arms, Lower Arms, Wrists
    upper_arm_position VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (upper_arm_position IN ('flexed_0_20', 'flexed_20_45', 'flexed_45_90', 'flexed_over_90', 'extended_over_20', '')),
    upper_arm_score INTEGER
        CHECK (upper_arm_score IS NULL OR upper_arm_score BETWEEN 1 AND 6),
    shoulder_raised VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shoulder_raised IN ('yes', 'no', '')),
    upper_arm_abducted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (upper_arm_abducted IN ('yes', 'no', '')),
    lower_arm_position VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (lower_arm_position IN ('flexed_60_100', 'flexed_under_60_or_over_100', '')),
    lower_arm_score INTEGER
        CHECK (lower_arm_score IS NULL OR lower_arm_score BETWEEN 1 AND 2),
    wrist_position VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wrist_position IN ('neutral', 'flexed_0_15', 'flexed_over_15', 'extended_over_15', '')),
    wrist_score INTEGER
        CHECK (wrist_score IS NULL OR wrist_score BETWEEN 1 AND 3),
    wrist_deviated VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wrist_deviated IN ('yes', 'no', '')),
    wrist_twisted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wrist_twisted IN ('yes', 'no', '')),

    posture_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_posture_updated_at
    BEFORE UPDATE ON assessment_posture
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_posture IS
    'Step 3 Posture Assessment: REBA body posture scoring for Group A (trunk, neck, legs) and Group B (upper arms, lower arms, wrists). One-to-one child of assessment.';
COMMENT ON COLUMN assessment_posture.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_posture.trunk_position IS
    'REBA trunk position classification.';
COMMENT ON COLUMN assessment_posture.trunk_score IS
    'REBA trunk posture score (1-5).';
COMMENT ON COLUMN assessment_posture.trunk_side_bent IS
    'Whether the trunk is side-bent (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.trunk_twisted IS
    'Whether the trunk is twisted (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.neck_position IS
    'REBA neck position classification.';
COMMENT ON COLUMN assessment_posture.neck_score IS
    'REBA neck posture score (1-3).';
COMMENT ON COLUMN assessment_posture.neck_side_bent IS
    'Whether the neck is side-bent (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.neck_twisted IS
    'Whether the neck is twisted (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.leg_position IS
    'REBA leg position: bilateral or unilateral weight bearing.';
COMMENT ON COLUMN assessment_posture.leg_score IS
    'REBA leg posture score (1-4).';
COMMENT ON COLUMN assessment_posture.knee_flexion IS
    'Degree of knee flexion.';
COMMENT ON COLUMN assessment_posture.upper_arm_position IS
    'REBA upper arm position classification.';
COMMENT ON COLUMN assessment_posture.upper_arm_score IS
    'REBA upper arm posture score (1-6).';
COMMENT ON COLUMN assessment_posture.shoulder_raised IS
    'Whether the shoulder is raised (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.upper_arm_abducted IS
    'Whether the upper arm is abducted (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.lower_arm_position IS
    'REBA lower arm position classification.';
COMMENT ON COLUMN assessment_posture.lower_arm_score IS
    'REBA lower arm posture score (1-2).';
COMMENT ON COLUMN assessment_posture.wrist_position IS
    'REBA wrist position classification.';
COMMENT ON COLUMN assessment_posture.wrist_score IS
    'REBA wrist posture score (1-3).';
COMMENT ON COLUMN assessment_posture.wrist_deviated IS
    'Whether the wrist is deviated (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.wrist_twisted IS
    'Whether the wrist is twisted (+1 modifier in REBA).';
COMMENT ON COLUMN assessment_posture.posture_notes IS
    'Additional observations about posture.';
