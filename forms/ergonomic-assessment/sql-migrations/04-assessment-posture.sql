-- ============================================================
-- 04_assessment_posture.sql
-- Posture assessment data with REBA regional scores (1:1).
-- ============================================================

CREATE TABLE assessment_posture (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    sitting_posture     TEXT NOT NULL DEFAULT ''
                        CHECK (sitting_posture IN ('upright', 'slouched', 'leaning-forward', 'reclined', '')),
    standing_posture    TEXT NOT NULL DEFAULT ''
                        CHECK (standing_posture IN ('upright', 'leaning', 'asymmetric', 'not-applicable', '')),
    neck_angle          TEXT NOT NULL DEFAULT ''
                        CHECK (neck_angle IN ('neutral', 'flexed-0-20', 'flexed-20-plus', 'extended', 'twisted', '')),
    trunk_angle         TEXT NOT NULL DEFAULT ''
                        CHECK (trunk_angle IN ('neutral', 'flexed-0-20', 'flexed-20-60', 'flexed-60-plus', 'twisted', '')),
    shoulder_position   TEXT NOT NULL DEFAULT ''
                        CHECK (shoulder_position IN ('neutral', 'raised', 'abducted', 'flexed', '')),
    wrist_deviation     TEXT NOT NULL DEFAULT ''
                        CHECK (wrist_deviation IN ('neutral', 'flexed', 'extended', 'ulnar-deviated', 'radial-deviated', '')),

    -- Optional clinician-provided REBA regional scores
    neck_score          INTEGER CHECK (neck_score IS NULL OR (neck_score >= 1 AND neck_score <= 6)),
    trunk_score         INTEGER CHECK (trunk_score IS NULL OR (trunk_score >= 1 AND trunk_score <= 6)),
    leg_score           INTEGER CHECK (leg_score IS NULL OR (leg_score >= 1 AND leg_score <= 4)),
    upper_arm_score     INTEGER CHECK (upper_arm_score IS NULL OR (upper_arm_score >= 1 AND upper_arm_score <= 6)),
    lower_arm_score     INTEGER CHECK (lower_arm_score IS NULL OR (lower_arm_score >= 1 AND lower_arm_score <= 3)),
    wrist_score         INTEGER CHECK (wrist_score IS NULL OR (wrist_score >= 1 AND wrist_score <= 4)),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_assessment_posture_updated_at
    BEFORE UPDATE ON assessment_posture
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_posture IS
    'Posture assessment: sitting/standing posture, neck, trunk, shoulder, wrist positions, plus optional REBA regional scores.';
COMMENT ON COLUMN assessment_posture.sitting_posture IS
    'Sitting posture observation: upright, slouched, leaning-forward, reclined, or empty.';
COMMENT ON COLUMN assessment_posture.standing_posture IS
    'Standing posture observation: upright, leaning, asymmetric, not-applicable, or empty.';
COMMENT ON COLUMN assessment_posture.neck_angle IS
    'Neck angle: neutral, flexed-0-20, flexed-20-plus, extended, twisted, or empty.';
COMMENT ON COLUMN assessment_posture.trunk_angle IS
    'Trunk angle: neutral, flexed-0-20, flexed-20-60, flexed-60-plus, twisted, or empty.';
COMMENT ON COLUMN assessment_posture.shoulder_position IS
    'Shoulder position: neutral, raised, abducted, flexed, or empty.';
COMMENT ON COLUMN assessment_posture.wrist_deviation IS
    'Wrist position: neutral, flexed, extended, ulnar-deviated, radial-deviated, or empty.';
COMMENT ON COLUMN assessment_posture.neck_score IS
    'Optional REBA neck score (1-6). NULL if not assessed by clinician.';
COMMENT ON COLUMN assessment_posture.trunk_score IS
    'Optional REBA trunk score (1-6). NULL if not assessed by clinician.';
COMMENT ON COLUMN assessment_posture.leg_score IS
    'Optional REBA leg score (1-4). NULL if not assessed by clinician.';
COMMENT ON COLUMN assessment_posture.upper_arm_score IS
    'Optional REBA upper arm score (1-6). NULL if not assessed by clinician.';
COMMENT ON COLUMN assessment_posture.lower_arm_score IS
    'Optional REBA lower arm score (1-3). NULL if not assessed by clinician.';
COMMENT ON COLUMN assessment_posture.wrist_score IS
    'Optional REBA wrist score (1-4). NULL if not assessed by clinician.';
