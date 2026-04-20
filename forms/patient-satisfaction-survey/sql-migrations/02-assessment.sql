-- 02_assessment.sql
-- Top-level patient satisfaction survey linking a patient to a survey instance.

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
    'Patient satisfaction survey using Likert-scale scoring across care domains. Parent entity for all survey sections.';
COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.patient_id IS
    'Foreign key to the patient who completed this survey.';
COMMENT ON COLUMN assessment.status IS
    'Lifecycle status: draft, submitted, reviewed, or urgent.';
