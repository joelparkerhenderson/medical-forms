-- 02-assessment.sql
-- Top-level care privacy notice form linking a patient to an assessment instance.

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
    'Assessment form instance. Parent entity for all sections.';
COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.patient_id IS
    'Foreign key to the patient this assessment belongs to.';
COMMENT ON COLUMN assessment.status IS
    'Workflow status: draft, submitted, reviewed, or urgent.';
COMMENT ON COLUMN assessment.created_at IS
    'Timestamp when the row was created.';
COMMENT ON COLUMN assessment.updated_at IS
    'Timestamp when the row was last updated.';
