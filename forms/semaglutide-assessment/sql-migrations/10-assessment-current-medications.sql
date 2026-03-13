-- 10_assessment_current_medications.sql
-- Current medications section of the semaglutide assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    currently_on_insulin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_insulin IN ('yes', 'no', '')),
    insulin_type TEXT NOT NULL DEFAULT '',
    insulin_dose TEXT NOT NULL DEFAULT '',
    currently_on_sulfonylurea VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_sulfonylurea IN ('yes', 'no', '')),
    sulfonylurea_name TEXT NOT NULL DEFAULT '',
    currently_on_metformin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_metformin IN ('yes', 'no', '')),
    metformin_dose_mg INTEGER
        CHECK (metformin_dose_mg IS NULL OR metformin_dose_mg >= 0),
    currently_on_sglt2_inhibitor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_sglt2_inhibitor IN ('yes', 'no', '')),
    sglt2_inhibitor_name TEXT NOT NULL DEFAULT '',
    currently_on_other_glp1 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_other_glp1 IN ('yes', 'no', '')),
    other_glp1_name TEXT NOT NULL DEFAULT '',
    antihypertensive_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antihypertensive_use IN ('yes', 'no', '')),
    antihypertensive_details TEXT NOT NULL DEFAULT '',
    statin_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (statin_use IN ('yes', 'no', '')),
    anticoagulant_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticoagulant_use IN ('yes', 'no', '')),
    oral_contraceptive_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oral_contraceptive_use IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: diabetes medications, cardiovascular drugs, and drug interactions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.currently_on_insulin IS
    'Whether currently taking insulin (dose adjustment may be needed).';
COMMENT ON COLUMN assessment_current_medications.insulin_type IS
    'Type of insulin (e.g. basal, bolus, mixed).';
COMMENT ON COLUMN assessment_current_medications.insulin_dose IS
    'Current insulin dose details.';
COMMENT ON COLUMN assessment_current_medications.currently_on_sulfonylurea IS
    'Whether currently taking a sulfonylurea (hypoglycaemia risk with GLP-1 RA).';
COMMENT ON COLUMN assessment_current_medications.sulfonylurea_name IS
    'Name and dose of sulfonylurea.';
COMMENT ON COLUMN assessment_current_medications.currently_on_metformin IS
    'Whether currently taking metformin.';
COMMENT ON COLUMN assessment_current_medications.metformin_dose_mg IS
    'Current metformin daily dose in mg.';
COMMENT ON COLUMN assessment_current_medications.currently_on_sglt2_inhibitor IS
    'Whether currently taking an SGLT2 inhibitor.';
COMMENT ON COLUMN assessment_current_medications.sglt2_inhibitor_name IS
    'Name of SGLT2 inhibitor.';
COMMENT ON COLUMN assessment_current_medications.currently_on_other_glp1 IS
    'Whether currently taking another GLP-1 receptor agonist (must discontinue).';
COMMENT ON COLUMN assessment_current_medications.other_glp1_name IS
    'Name of other GLP-1 receptor agonist.';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_use IS
    'Whether currently taking antihypertensive medications.';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_details IS
    'Details of antihypertensive medications.';
COMMENT ON COLUMN assessment_current_medications.statin_use IS
    'Whether currently taking a statin.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_use IS
    'Whether currently taking anticoagulants (warfarin absorption may be affected).';
COMMENT ON COLUMN assessment_current_medications.oral_contraceptive_use IS
    'Whether currently using oral contraceptives (absorption may be altered by delayed gastric emptying).';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other current medications.';
