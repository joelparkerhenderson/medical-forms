-- 14-assessment-musculoskeletal.sql
-- Step 12: musculoskeletal and integumentary examination.

CREATE TABLE assessment_musculoskeletal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    spine_exam VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (spine_exam IN ('normal', 'scoliosis', 'kyphosis', 'previous-surgery', 'ankylosing-spondylitis', 'other', '')),
    spine_notes TEXT NOT NULL DEFAULT '',
    neuraxial_suitable VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (neuraxial_suitable IN ('yes', 'no', 'unsure', '')),

    joint_rom_hip VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (joint_rom_hip IN ('full', 'reduced', 'severely-limited', '')),
    joint_rom_shoulder VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (joint_rom_shoulder IN ('full', 'reduced', 'severely-limited', '')),
    joint_rom_neck VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (joint_rom_neck IN ('full', 'reduced', 'severely-limited', '')),

    skin_iv_access VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (skin_iv_access IN ('good', 'difficult', 'very-difficult', '')),
    skin_block_site VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (skin_block_site IN ('intact', 'infected', 'tattooed', 'scarred', '')),
    pressure_ulcer_risk VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (pressure_ulcer_risk IN ('low', 'moderate', 'high', 'very-high', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_musculoskeletal_updated_at
    BEFORE UPDATE ON assessment_musculoskeletal
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_musculoskeletal IS
    'Step 12: musculoskeletal and integumentary examination for positioning, neuraxial suitability, IV access, and pressure-ulcer risk.';
COMMENT ON COLUMN assessment_musculoskeletal.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_musculoskeletal.spine_exam IS
    'Spine examination: normal, scoliosis, kyphosis, previous-surgery, ankylosing-spondylitis, other.';
COMMENT ON COLUMN assessment_musculoskeletal.spine_notes IS
    'Free-text spine examination notes.';
COMMENT ON COLUMN assessment_musculoskeletal.neuraxial_suitable IS
    'Clinician assessment of neuraxial anaesthesia feasibility.';
COMMENT ON COLUMN assessment_musculoskeletal.joint_rom_hip IS
    'Hip joint range of motion: full, reduced, severely-limited.';
COMMENT ON COLUMN assessment_musculoskeletal.joint_rom_shoulder IS
    'Shoulder joint range of motion: full, reduced, severely-limited.';
COMMENT ON COLUMN assessment_musculoskeletal.joint_rom_neck IS
    'Neck range of motion: full, reduced, severely-limited.';
COMMENT ON COLUMN assessment_musculoskeletal.skin_iv_access IS
    'Ease of IV access: good, difficult, very-difficult.';
COMMENT ON COLUMN assessment_musculoskeletal.skin_block_site IS
    'Skin at regional block sites: intact, infected, tattooed, scarred.';
COMMENT ON COLUMN assessment_musculoskeletal.pressure_ulcer_risk IS
    'Pressure ulcer risk (Waterlow or equivalent): low, moderate, high, very-high.';
