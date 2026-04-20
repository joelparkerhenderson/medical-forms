-- 05_assessment_medical_history.sql
-- Medical history section of the bone marrow donation assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_autoimmune_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autoimmune_disease IN ('yes', 'no', '')),
    autoimmune_details TEXT NOT NULL DEFAULT '',
    has_malignancy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_malignancy IN ('yes', 'no', '')),
    malignancy_details TEXT NOT NULL DEFAULT '',
    has_cardiovascular_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_cardiovascular_disease IN ('yes', 'no', '')),
    cardiovascular_details TEXT NOT NULL DEFAULT '',
    has_respiratory_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_respiratory_disease IN ('yes', 'no', '')),
    respiratory_details TEXT NOT NULL DEFAULT '',
    has_renal_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_renal_disease IN ('yes', 'no', '')),
    renal_details TEXT NOT NULL DEFAULT '',
    has_hepatic_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_hepatic_disease IN ('yes', 'no', '')),
    hepatic_details TEXT NOT NULL DEFAULT '',
    has_bleeding_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_bleeding_disorder IN ('yes', 'no', '')),
    bleeding_disorder_details TEXT NOT NULL DEFAULT '',
    has_neurological_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_neurological_condition IN ('yes', 'no', '')),
    neurological_details TEXT NOT NULL DEFAULT '',
    current_medications TEXT NOT NULL DEFAULT '',
    drug_allergies TEXT NOT NULL DEFAULT '',
    previous_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_surgery IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    medical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: comorbidities, medications, allergies, surgical history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_autoimmune_disease IS
    'Whether donor has autoimmune disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.autoimmune_details IS
    'Details of autoimmune disease if applicable.';
COMMENT ON COLUMN assessment_medical_history.has_malignancy IS
    'Whether donor has history of malignancy: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.malignancy_details IS
    'Details of malignancy if applicable.';
COMMENT ON COLUMN assessment_medical_history.has_cardiovascular_disease IS
    'Whether donor has cardiovascular disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.cardiovascular_details IS
    'Details of cardiovascular disease if applicable.';
COMMENT ON COLUMN assessment_medical_history.has_respiratory_disease IS
    'Whether donor has respiratory disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.respiratory_details IS
    'Details of respiratory disease if applicable.';
COMMENT ON COLUMN assessment_medical_history.has_renal_disease IS
    'Whether donor has renal disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_hepatic_disease IS
    'Whether donor has hepatic disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_bleeding_disorder IS
    'Whether donor has a bleeding disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.has_neurological_condition IS
    'Whether donor has a neurological condition: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.current_medications IS
    'List of current medications.';
COMMENT ON COLUMN assessment_medical_history.drug_allergies IS
    'Known drug allergies.';
COMMENT ON COLUMN assessment_medical_history.previous_surgery IS
    'Whether donor has had previous surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.medical_history_notes IS
    'Additional clinician notes on medical history.';
