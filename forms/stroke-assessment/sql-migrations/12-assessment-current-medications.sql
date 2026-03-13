-- 12_assessment_current_medications.sql
-- Current medications section of the stroke assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    anticoagulant_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticoagulant_use IN ('yes', 'no', '')),
    anticoagulant_name TEXT NOT NULL DEFAULT '',
    last_anticoagulant_dose_time TIMESTAMPTZ,
    inr_value NUMERIC(4,1)
        CHECK (inr_value IS NULL OR inr_value >= 0),
    antiplatelet_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antiplatelet_use IN ('yes', 'no', '')),
    antiplatelet_name TEXT NOT NULL DEFAULT '',
    antihypertensive_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antihypertensive_use IN ('yes', 'no', '')),
    antihypertensive_details TEXT NOT NULL DEFAULT '',
    statin_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (statin_use IN ('yes', 'no', '')),
    diabetic_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetic_medication IN ('yes', 'no', '')),
    diabetic_medication_details TEXT NOT NULL DEFAULT '',
    recent_thrombolytic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_thrombolytic IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',
    known_drug_allergies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: anticoagulants, antiplatelets, and other drugs relevant to acute stroke management. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_use IS
    'Whether currently taking anticoagulants (critical for thrombolysis decision).';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_name IS
    'Name of anticoagulant (e.g. warfarin, apixaban, rivaroxaban, dabigatran).';
COMMENT ON COLUMN assessment_current_medications.last_anticoagulant_dose_time IS
    'Time of last anticoagulant dose.';
COMMENT ON COLUMN assessment_current_medications.inr_value IS
    'INR value if on warfarin (thrombolysis contraindicated if INR > 1.7).';
COMMENT ON COLUMN assessment_current_medications.antiplatelet_use IS
    'Whether currently taking antiplatelet agents.';
COMMENT ON COLUMN assessment_current_medications.antiplatelet_name IS
    'Name of antiplatelet (e.g. aspirin, clopidogrel, ticagrelor).';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_use IS
    'Whether currently taking antihypertensive medications.';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_details IS
    'Details of antihypertensive medications.';
COMMENT ON COLUMN assessment_current_medications.statin_use IS
    'Whether currently taking a statin.';
COMMENT ON COLUMN assessment_current_medications.diabetic_medication IS
    'Whether currently taking diabetic medication.';
COMMENT ON COLUMN assessment_current_medications.diabetic_medication_details IS
    'Details of diabetic medications.';
COMMENT ON COLUMN assessment_current_medications.recent_thrombolytic IS
    'Whether patient has received a thrombolytic agent recently.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other current medications.';
COMMENT ON COLUMN assessment_current_medications.known_drug_allergies IS
    'Known drug allergies.';
