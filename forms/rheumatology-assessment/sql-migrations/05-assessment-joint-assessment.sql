-- 05_assessment_joint_assessment.sql
-- Joint assessment section of the rheumatology assessment (DAS28 core).

CREATE TABLE assessment_joint_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- DAS28 counts: 28 joints assessed for tenderness and swelling
    tender_joint_count_28 INTEGER
        CHECK (tender_joint_count_28 IS NULL OR (tender_joint_count_28 >= 0 AND tender_joint_count_28 <= 28)),
    swollen_joint_count_28 INTEGER
        CHECK (swollen_joint_count_28 IS NULL OR (swollen_joint_count_28 >= 0 AND swollen_joint_count_28 <= 28)),

    -- Individual joint involvement (boolean flags for key joint groups)
    shoulders_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shoulders_involved IN ('yes', 'no', '')),
    elbows_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (elbows_involved IN ('yes', 'no', '')),
    wrists_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wrists_involved IN ('yes', 'no', '')),
    mcp_joints_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mcp_joints_involved IN ('yes', 'no', '')),
    pip_joints_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pip_joints_involved IN ('yes', 'no', '')),
    knees_involved VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (knees_involved IN ('yes', 'no', '')),

    joint_deformity_present VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (joint_deformity_present IN ('yes', 'no', '')),
    joint_deformity_details TEXT NOT NULL DEFAULT '',
    joint_pattern VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (joint_pattern IN ('symmetric', 'asymmetric', 'monoarticular', 'polyarticular', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_joint_assessment_updated_at
    BEFORE UPDATE ON assessment_joint_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_joint_assessment IS
    'Joint assessment section: DAS28 tender and swollen joint counts plus individual joint group involvement. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_joint_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_joint_assessment.tender_joint_count_28 IS
    'Number of tender joints out of 28 assessed (DAS28 component).';
COMMENT ON COLUMN assessment_joint_assessment.swollen_joint_count_28 IS
    'Number of swollen joints out of 28 assessed (DAS28 component).';
COMMENT ON COLUMN assessment_joint_assessment.shoulders_involved IS
    'Whether shoulders are involved: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_joint_assessment.elbows_involved IS
    'Whether elbows are involved: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_joint_assessment.wrists_involved IS
    'Whether wrists are involved: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_joint_assessment.mcp_joints_involved IS
    'Whether metacarpophalangeal (MCP) joints are involved.';
COMMENT ON COLUMN assessment_joint_assessment.pip_joints_involved IS
    'Whether proximal interphalangeal (PIP) joints are involved.';
COMMENT ON COLUMN assessment_joint_assessment.knees_involved IS
    'Whether knees are involved: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_joint_assessment.joint_deformity_present IS
    'Whether joint deformity is present: yes, no, or empty string if unanswered.';
COMMENT ON COLUMN assessment_joint_assessment.joint_deformity_details IS
    'Free-text description of joint deformities if present.';
COMMENT ON COLUMN assessment_joint_assessment.joint_pattern IS
    'Distribution pattern: symmetric, asymmetric, monoarticular, polyarticular, or empty string if unanswered.';
