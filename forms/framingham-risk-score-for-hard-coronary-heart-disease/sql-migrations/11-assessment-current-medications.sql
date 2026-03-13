-- 11_assessment_current_medications.sql
-- Step 9: Current medications section of the Framingham Risk Score assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    on_statin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_statin IN ('yes', 'no', '')),
    statin_name VARCHAR(255) NOT NULL DEFAULT '',
    on_aspirin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_aspirin IN ('yes', 'no', '')),
    on_antihypertensive VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antihypertensive IN ('yes', 'no', '')),
    antihypertensive_name VARCHAR(255) NOT NULL DEFAULT '',
    other_medications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Step 9 Current Medications: cardiovascular medications relevant to risk management. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.on_statin IS
    'Whether the patient takes a statin (lipid-lowering therapy).';
COMMENT ON COLUMN assessment_current_medications.statin_name IS
    'Name of statin medication.';
COMMENT ON COLUMN assessment_current_medications.on_aspirin IS
    'Whether the patient takes aspirin (antiplatelet therapy).';
COMMENT ON COLUMN assessment_current_medications.on_antihypertensive IS
    'Whether the patient takes antihypertensive medication (affects Framingham BP coefficient).';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_name IS
    'Name of antihypertensive medication.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of all other current medications.';
