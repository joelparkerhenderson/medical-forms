-- 02_assessment.sql
-- Top-level advance decision to refuse treatment linking a patient to an assessment instance.

CREATE TABLE assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patient(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'reviewed', 'urgent')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_updated_at
    BEFORE UPDATE ON assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment IS
    'Advance decision to refuse treatment form. Parent entity for all assessment sections per Mental Capacity Act 2005.';
COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.patient_id IS
    'Foreign key to the patient who owns this advance decision.';
COMMENT ON COLUMN assessment.status IS
    'Lifecycle status: draft, submitted, reviewed, or urgent.';
