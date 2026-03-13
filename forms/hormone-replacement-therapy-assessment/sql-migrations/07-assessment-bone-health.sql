-- 07_assessment_bone_health.sql
-- Bone health section of the HRT assessment.

CREATE TABLE assessment_bone_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_fracture VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_fracture IN ('yes', 'no', '')),
    fracture_details TEXT NOT NULL DEFAULT '',
    fragility_fracture VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fragility_fracture IN ('yes', 'no', '')),
    family_history_osteoporosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_osteoporosis IN ('yes', 'no', '')),
    family_history_hip_fracture VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_history_hip_fracture IN ('yes', 'no', '')),
    dexa_scan_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dexa_scan_performed IN ('yes', 'no', '')),
    dexa_scan_date DATE,
    spine_t_score NUMERIC(4,1),
    hip_t_score NUMERIC(4,1),
    dexa_result VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (dexa_result IN ('normal', 'osteopenia', 'osteoporosis', '')),
    calcium_intake VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (calcium_intake IN ('adequate', 'inadequate', 'unknown', '')),
    vitamin_d_level NUMERIC(5,1),
    vitamin_d_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vitamin_d_supplementation IN ('yes', 'no', '')),
    corticosteroid_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (corticosteroid_use IN ('yes', 'no', '')),
    corticosteroid_details TEXT NOT NULL DEFAULT '',
    frax_score NUMERIC(5,1),
    bone_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_bone_health_updated_at
    BEFORE UPDATE ON assessment_bone_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_bone_health IS
    'Bone health section: fracture history, DEXA results, calcium, vitamin D, and FRAX score. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_bone_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_bone_health.previous_fracture IS
    'Whether there is a history of fracture: yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.fracture_details IS
    'Details of previous fractures.';
COMMENT ON COLUMN assessment_bone_health.fragility_fracture IS
    'Whether any fracture was a fragility fracture (from standing height or less): yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.family_history_osteoporosis IS
    'Whether there is a family history of osteoporosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.family_history_hip_fracture IS
    'Whether there is a parental history of hip fracture: yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.dexa_scan_performed IS
    'Whether a DEXA scan has been performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.dexa_scan_date IS
    'Date of most recent DEXA scan, NULL if not performed.';
COMMENT ON COLUMN assessment_bone_health.spine_t_score IS
    'Lumbar spine T-score from DEXA scan, NULL if not tested.';
COMMENT ON COLUMN assessment_bone_health.hip_t_score IS
    'Hip (femoral neck) T-score from DEXA scan, NULL if not tested.';
COMMENT ON COLUMN assessment_bone_health.dexa_result IS
    'DEXA scan result: normal (T > -1), osteopenia (T -1 to -2.5), osteoporosis (T < -2.5), or empty string.';
COMMENT ON COLUMN assessment_bone_health.calcium_intake IS
    'Dietary calcium intake: adequate, inadequate, unknown, or empty string.';
COMMENT ON COLUMN assessment_bone_health.vitamin_d_level IS
    'Vitamin D level in nmol/L, NULL if not tested.';
COMMENT ON COLUMN assessment_bone_health.vitamin_d_supplementation IS
    'Whether vitamin D supplementation is taken: yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.corticosteroid_use IS
    'Whether long-term corticosteroid use is present: yes, no, or empty string.';
COMMENT ON COLUMN assessment_bone_health.corticosteroid_details IS
    'Details of corticosteroid use.';
COMMENT ON COLUMN assessment_bone_health.frax_score IS
    'FRAX 10-year fracture probability percentage, NULL if not calculated.';
COMMENT ON COLUMN assessment_bone_health.bone_health_notes IS
    'Free-text notes on bone health.';
