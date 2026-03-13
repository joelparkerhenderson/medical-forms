-- 11_assessment_current_treatment.sql
-- Current treatment section of the orthopaedic assessment.

CREATE TABLE assessment_current_treatment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_physiotherapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_physiotherapy IN ('yes', 'no', '')),
    physiotherapy_details TEXT NOT NULL DEFAULT '',
    has_occupational_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_occupational_therapy IN ('yes', 'no', '')),
    occupational_therapy_details TEXT NOT NULL DEFAULT '',
    has_injection_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_injection_therapy IN ('yes', 'no', '')),
    injection_details TEXT NOT NULL DEFAULT '',
    has_splinting_bracing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_splinting_bracing IN ('yes', 'no', '')),
    splinting_bracing_details TEXT NOT NULL DEFAULT '',
    current_medications TEXT NOT NULL DEFAULT '',
    has_alternative_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_alternative_therapy IN ('yes', 'no', '')),
    alternative_therapy_details TEXT NOT NULL DEFAULT '',
    treatment_effectiveness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (treatment_effectiveness IN ('effective', 'partially-effective', 'ineffective', 'not-started', '')),
    current_treatment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_treatment_updated_at
    BEFORE UPDATE ON assessment_current_treatment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_treatment IS
    'Current treatment section: physiotherapy, OT, injections, splinting, medications, and effectiveness. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_treatment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_treatment.has_physiotherapy IS
    'Whether the patient is receiving physiotherapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.physiotherapy_details IS
    'Details of physiotherapy treatment.';
COMMENT ON COLUMN assessment_current_treatment.has_occupational_therapy IS
    'Whether the patient is receiving occupational therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.occupational_therapy_details IS
    'Details of occupational therapy treatment.';
COMMENT ON COLUMN assessment_current_treatment.has_injection_therapy IS
    'Whether the patient has had injection therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.injection_details IS
    'Details of injection therapy (type, site, date, response).';
COMMENT ON COLUMN assessment_current_treatment.has_splinting_bracing IS
    'Whether the patient uses a splint or brace: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.splinting_bracing_details IS
    'Details of splinting or bracing in use.';
COMMENT ON COLUMN assessment_current_treatment.current_medications IS
    'Current medications related to the orthopaedic condition.';
COMMENT ON COLUMN assessment_current_treatment.has_alternative_therapy IS
    'Whether the patient uses alternative therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.alternative_therapy_details IS
    'Details of alternative therapy (acupuncture, osteopathy, etc.).';
COMMENT ON COLUMN assessment_current_treatment.treatment_effectiveness IS
    'Effectiveness of current treatment: effective, partially-effective, ineffective, not-started, or empty.';
COMMENT ON COLUMN assessment_current_treatment.current_treatment_notes IS
    'Additional clinician notes on current treatment.';
