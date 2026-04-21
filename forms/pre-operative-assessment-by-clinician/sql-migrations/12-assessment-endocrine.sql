-- 12-assessment-endocrine.sql
-- Step 10: endocrine function.

CREATE TABLE assessment_endocrine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    diabetes_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diabetes_type IN ('none', 'type-1', 'type-2', 'gestational', 'other', '')),
    diabetes_on_insulin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes_on_insulin IN ('yes', 'no', '')),
    hba1c_mmol_mol INTEGER,
    fasting_glucose_mmol_l NUMERIC(3,1),
    random_glucose_mmol_l NUMERIC(3,1),
    diabetes_control VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (diabetes_control IN ('well-controlled', 'suboptimal', 'poor', '')),
    diabetes_complications VARCHAR(255) NOT NULL DEFAULT '',

    thyroid_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (thyroid_status IN ('euthyroid', 'hypothyroid', 'hyperthyroid', '')),
    tsh_mu_l NUMERIC(6,2),

    adrenal_status VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (adrenal_status IN ('normal', 'addisons', 'cushings', 'on-steroid-cover', '')),
    on_long_term_steroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_long_term_steroids IN ('yes', 'no', '')),
    steroid_dose_mg NUMERIC(5,1),
    steroid_cover_plan VARCHAR(255) NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_endocrine_updated_at
    BEFORE UPDATE ON assessment_endocrine
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_endocrine IS
    'Step 10: endocrine status including diabetes control, thyroid and adrenal function, and perioperative steroid cover plan.';
COMMENT ON COLUMN assessment_endocrine.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_endocrine.diabetes_type IS
    'Diabetes type: none, type-1, type-2, gestational, other.';
COMMENT ON COLUMN assessment_endocrine.diabetes_on_insulin IS
    'Whether patient is on insulin therapy.';
COMMENT ON COLUMN assessment_endocrine.hba1c_mmol_mol IS
    'HbA1c in mmol/mol.';
COMMENT ON COLUMN assessment_endocrine.fasting_glucose_mmol_l IS
    'Fasting blood glucose in mmol/L.';
COMMENT ON COLUMN assessment_endocrine.random_glucose_mmol_l IS
    'Random blood glucose in mmol/L.';
COMMENT ON COLUMN assessment_endocrine.diabetes_control IS
    'Clinician summary of diabetes control: well-controlled, suboptimal, poor.';
COMMENT ON COLUMN assessment_endocrine.diabetes_complications IS
    'Free-text description of diabetes complications (retinopathy, nephropathy, neuropathy).';
COMMENT ON COLUMN assessment_endocrine.thyroid_status IS
    'Thyroid status: euthyroid, hypothyroid, hyperthyroid.';
COMMENT ON COLUMN assessment_endocrine.tsh_mu_l IS
    'TSH in mU/L.';
COMMENT ON COLUMN assessment_endocrine.adrenal_status IS
    'Adrenal status: normal, addisons, cushings, on-steroid-cover.';
COMMENT ON COLUMN assessment_endocrine.on_long_term_steroids IS
    'Whether patient is on long-term steroid therapy.';
COMMENT ON COLUMN assessment_endocrine.steroid_dose_mg IS
    'Current daily prednisolone-equivalent dose in mg.';
COMMENT ON COLUMN assessment_endocrine.steroid_cover_plan IS
    'Perioperative steroid cover plan.';
