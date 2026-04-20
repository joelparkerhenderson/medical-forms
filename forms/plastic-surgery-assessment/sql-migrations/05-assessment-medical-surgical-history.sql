-- 05_assessment_medical_surgical_history.sql
-- Medical and surgical history section of the plastic surgery assessment.

CREATE TABLE assessment_medical_surgical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_plastic_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_plastic_surgery IN ('yes', 'no', '')),
    previous_plastic_surgery_details TEXT NOT NULL DEFAULT '',
    previous_general_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_general_surgery IN ('yes', 'no', '')),
    previous_general_surgery_details TEXT NOT NULL DEFAULT '',
    wound_healing_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wound_healing_problems IN ('yes', 'no', '')),
    wound_healing_details TEXT NOT NULL DEFAULT '',
    keloid_hypertrophic_scarring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (keloid_hypertrophic_scarring IN ('yes', 'no', '')),
    scarring_details TEXT NOT NULL DEFAULT '',
    diabetes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('type-1', 'type-2', 'no', '')),
    diabetes_controlled VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes_controlled IN ('yes', 'no', '')),
    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    cardiac_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cardiac_disease IN ('yes', 'no', '')),
    cardiac_disease_details TEXT NOT NULL DEFAULT '',
    respiratory_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (respiratory_disease IN ('yes', 'no', '')),
    respiratory_disease_details TEXT NOT NULL DEFAULT '',
    autoimmune_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (autoimmune_disease IN ('yes', 'no', '')),
    autoimmune_disease_details TEXT NOT NULL DEFAULT '',
    bleeding_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bleeding_disorder IN ('yes', 'no', '')),
    bleeding_disorder_details TEXT NOT NULL DEFAULT '',
    immunosuppressed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (immunosuppressed IN ('yes', 'no', '')),
    immunosuppressed_details TEXT NOT NULL DEFAULT '',
    cancer_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cancer_history IN ('yes', 'no', '')),
    cancer_history_details TEXT NOT NULL DEFAULT '',
    medical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_surgical_history_updated_at
    BEFORE UPDATE ON assessment_medical_surgical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_surgical_history IS
    'Medical and surgical history section: previous surgeries, wound healing, comorbidities. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_surgical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_surgical_history.previous_plastic_surgery IS
    'Whether the patient has had previous plastic surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_surgical_history.wound_healing_problems IS
    'Whether the patient has a history of wound healing problems: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_surgical_history.keloid_hypertrophic_scarring IS
    'Whether the patient has keloid or hypertrophic scarring tendency: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_surgical_history.diabetes IS
    'Diabetes status: type-1, type-2, no, or empty.';
COMMENT ON COLUMN assessment_medical_surgical_history.bleeding_disorder IS
    'Whether the patient has a bleeding disorder: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_surgical_history.immunosuppressed IS
    'Whether the patient is immunosuppressed: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_surgical_history.cancer_history IS
    'Whether the patient has a history of cancer: yes, no, or empty.';
