-- 02_assessment.sql
-- Top-level onboarding assessment linking an employee to an assessment instance.

CREATE TABLE assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    employee_id UUID NOT NULL
        REFERENCES employee(id) ON DELETE CASCADE,

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
    'Employee onboarding checklist assessment. Parent entity for all assessment sections.';
COMMENT ON COLUMN assessment.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN assessment.employee_id IS
    'Foreign key to the employee who owns this assessment.';
COMMENT ON COLUMN assessment.status IS
    'Lifecycle status: draft, submitted, reviewed, or urgent.';
