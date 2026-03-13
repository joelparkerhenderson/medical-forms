-- 08_assessment_medical_history.sql
-- Step 6: Medical history section of the Framingham Risk Score assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_diabetes IN ('yes', 'no', '')),
    has_prior_chd VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_prior_chd IN ('yes', 'no', '')),
    has_peripheral_vascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_peripheral_vascular_disease IN ('yes', 'no', '')),
    has_cerebrovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cerebrovascular_disease IN ('yes', 'no', '')),
    has_heart_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_heart_failure IN ('yes', 'no', '')),
    has_atrial_fibrillation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_atrial_fibrillation IN ('yes', 'no', '')),
    other_conditions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Step 6 Medical History: cardiovascular and metabolic conditions. The Framingham Hard CHD model is intended for patients without prior CHD or diabetes. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_diabetes IS
    'Whether the patient has diabetes (model intended for non-diabetic patients).';
COMMENT ON COLUMN assessment_medical_history.has_prior_chd IS
    'Whether the patient has prior coronary heart disease (model intended for patients without prior CHD).';
COMMENT ON COLUMN assessment_medical_history.has_peripheral_vascular_disease IS
    'Whether the patient has peripheral vascular disease.';
COMMENT ON COLUMN assessment_medical_history.has_cerebrovascular_disease IS
    'Whether the patient has cerebrovascular disease (stroke or TIA).';
COMMENT ON COLUMN assessment_medical_history.has_heart_failure IS
    'Whether the patient has heart failure.';
COMMENT ON COLUMN assessment_medical_history.has_atrial_fibrillation IS
    'Whether the patient has atrial fibrillation.';
COMMENT ON COLUMN assessment_medical_history.other_conditions IS
    'Free-text description of other relevant medical conditions.';
