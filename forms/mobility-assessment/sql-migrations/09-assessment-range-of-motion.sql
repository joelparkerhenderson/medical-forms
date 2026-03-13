-- 09_assessment_range_of_motion.sql
-- Range of motion section of the mobility assessment.

CREATE TABLE assessment_range_of_motion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hip_flexion_left INTEGER
        CHECK (hip_flexion_left IS NULL OR (hip_flexion_left >= 0 AND hip_flexion_left <= 180)),
    hip_flexion_right INTEGER
        CHECK (hip_flexion_right IS NULL OR (hip_flexion_right >= 0 AND hip_flexion_right <= 180)),
    hip_extension_left INTEGER
        CHECK (hip_extension_left IS NULL OR (hip_extension_left >= 0 AND hip_extension_left <= 60)),
    hip_extension_right INTEGER
        CHECK (hip_extension_right IS NULL OR (hip_extension_right >= 0 AND hip_extension_right <= 60)),
    knee_flexion_left INTEGER
        CHECK (knee_flexion_left IS NULL OR (knee_flexion_left >= 0 AND knee_flexion_left <= 180)),
    knee_flexion_right INTEGER
        CHECK (knee_flexion_right IS NULL OR (knee_flexion_right >= 0 AND knee_flexion_right <= 180)),
    knee_extension_left INTEGER
        CHECK (knee_extension_left IS NULL OR (knee_extension_left >= -30 AND knee_extension_left <= 15)),
    knee_extension_right INTEGER
        CHECK (knee_extension_right IS NULL OR (knee_extension_right >= -30 AND knee_extension_right <= 15)),
    ankle_dorsiflexion_left INTEGER
        CHECK (ankle_dorsiflexion_left IS NULL OR (ankle_dorsiflexion_left >= -20 AND ankle_dorsiflexion_left <= 40)),
    ankle_dorsiflexion_right INTEGER
        CHECK (ankle_dorsiflexion_right IS NULL OR (ankle_dorsiflexion_right >= -20 AND ankle_dorsiflexion_right <= 40)),
    ankle_plantarflexion_left INTEGER
        CHECK (ankle_plantarflexion_left IS NULL OR (ankle_plantarflexion_left >= 0 AND ankle_plantarflexion_left <= 60)),
    ankle_plantarflexion_right INTEGER
        CHECK (ankle_plantarflexion_right IS NULL OR (ankle_plantarflexion_right >= 0 AND ankle_plantarflexion_right <= 60)),
    joint_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (joint_pain IN ('yes', 'no', '')),
    joint_pain_details TEXT NOT NULL DEFAULT '',
    joint_stiffness VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (joint_stiffness IN ('yes', 'no', '')),
    range_of_motion_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_range_of_motion_updated_at
    BEFORE UPDATE ON assessment_range_of_motion
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_range_of_motion IS
    'Range of motion section: hip, knee, and ankle measurements in degrees for both sides. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_range_of_motion.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_range_of_motion.hip_flexion_left IS
    'Left hip flexion in degrees (normal ~120).';
COMMENT ON COLUMN assessment_range_of_motion.hip_flexion_right IS
    'Right hip flexion in degrees (normal ~120).';
COMMENT ON COLUMN assessment_range_of_motion.hip_extension_left IS
    'Left hip extension in degrees (normal ~30).';
COMMENT ON COLUMN assessment_range_of_motion.hip_extension_right IS
    'Right hip extension in degrees (normal ~30).';
COMMENT ON COLUMN assessment_range_of_motion.knee_flexion_left IS
    'Left knee flexion in degrees (normal ~135).';
COMMENT ON COLUMN assessment_range_of_motion.knee_flexion_right IS
    'Right knee flexion in degrees (normal ~135).';
COMMENT ON COLUMN assessment_range_of_motion.knee_extension_left IS
    'Left knee extension in degrees (normal 0, negative = flexion contracture).';
COMMENT ON COLUMN assessment_range_of_motion.knee_extension_right IS
    'Right knee extension in degrees (normal 0, negative = flexion contracture).';
COMMENT ON COLUMN assessment_range_of_motion.ankle_dorsiflexion_left IS
    'Left ankle dorsiflexion in degrees (normal ~20).';
COMMENT ON COLUMN assessment_range_of_motion.ankle_dorsiflexion_right IS
    'Right ankle dorsiflexion in degrees (normal ~20).';
COMMENT ON COLUMN assessment_range_of_motion.ankle_plantarflexion_left IS
    'Left ankle plantarflexion in degrees (normal ~50).';
COMMENT ON COLUMN assessment_range_of_motion.ankle_plantarflexion_right IS
    'Right ankle plantarflexion in degrees (normal ~50).';
COMMENT ON COLUMN assessment_range_of_motion.joint_pain IS
    'Whether joint pain was noted during ROM testing: yes, no, or empty string.';
COMMENT ON COLUMN assessment_range_of_motion.joint_pain_details IS
    'Free-text details of joint pain during ROM testing.';
COMMENT ON COLUMN assessment_range_of_motion.joint_stiffness IS
    'Whether joint stiffness was observed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_range_of_motion.range_of_motion_notes IS
    'Free-text clinician observations on range of motion.';
