-- 06_assessment_lipid_profile.sql
-- Lipid profile section of the assessment.

CREATE TABLE assessment_lipid_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    total_cholesterol NUMERIC(5,1),
    hdl_cholesterol NUMERIC(5,1),
    ldl_cholesterol NUMERIC(5,1),
    triglycerides NUMERIC(5,1),
    non_hdl_cholesterol NUMERIC(5,1),
    on_statin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_statin IN ('yes', 'no', '')),
    statin_name VARCHAR(255) NOT NULL DEFAULT '',
    on_other_lipid_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_other_lipid_therapy IN ('yes', 'no', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_lipid_profile_updated_at
    BEFORE UPDATE ON assessment_lipid_profile
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_lipid_profile IS
    'Lipid profile section: cholesterol, triglycerides, and lipid-lowering therapy. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_lipid_profile.total_cholesterol IS
    'Total cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_lipid_profile.hdl_cholesterol IS
    'HDL cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_lipid_profile.ldl_cholesterol IS
    'LDL cholesterol in mmol/L.';
COMMENT ON COLUMN assessment_lipid_profile.triglycerides IS
    'Triglycerides in mmol/L.';
COMMENT ON COLUMN assessment_lipid_profile.on_statin IS
    'Whether patient is on statin therapy.';
COMMENT ON COLUMN assessment_lipid_profile.statin_name IS
    'Name and dose of statin, if applicable.';
