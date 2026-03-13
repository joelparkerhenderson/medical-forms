-- 04_assessment_procedure_details.sql
-- Procedure details section of the consent to treatment form.

CREATE TABLE assessment_procedure_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    procedure_name VARCHAR(500) NOT NULL DEFAULT '',
    procedure_description TEXT NOT NULL DEFAULT '',
    procedure_site VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (procedure_site IN ('left', 'right', 'bilateral', 'midline', 'not-applicable', '')),
    procedure_site_details TEXT NOT NULL DEFAULT '',
    intended_benefit TEXT NOT NULL DEFAULT '',
    urgency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (urgency IN ('elective', 'urgent', 'emergency', '')),
    planned_date DATE,
    estimated_duration_minutes INTEGER
        CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0),
    performing_clinician VARCHAR(255) NOT NULL DEFAULT '',
    performing_clinician_role VARCHAR(100) NOT NULL DEFAULT '',
    supervised_by VARCHAR(255) NOT NULL DEFAULT '',
    additional_procedures TEXT NOT NULL DEFAULT '',
    procedure_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_procedure_details_updated_at
    BEFORE UPDATE ON assessment_procedure_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_procedure_details IS
    'Procedure details section: name, description, site, urgency, performing clinician. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_procedure_details.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_procedure_details.procedure_name IS
    'Name of the proposed procedure or treatment.';
COMMENT ON COLUMN assessment_procedure_details.procedure_description IS
    'Plain-language description of what the procedure involves.';
COMMENT ON COLUMN assessment_procedure_details.procedure_site IS
    'Laterality or site: left, right, bilateral, midline, not-applicable, or empty.';
COMMENT ON COLUMN assessment_procedure_details.procedure_site_details IS
    'Additional details about the procedure site.';
COMMENT ON COLUMN assessment_procedure_details.intended_benefit IS
    'Expected benefits of the procedure.';
COMMENT ON COLUMN assessment_procedure_details.urgency IS
    'Urgency of the procedure: elective, urgent, emergency, or empty.';
COMMENT ON COLUMN assessment_procedure_details.planned_date IS
    'Planned date of the procedure.';
COMMENT ON COLUMN assessment_procedure_details.estimated_duration_minutes IS
    'Estimated duration of the procedure in minutes.';
COMMENT ON COLUMN assessment_procedure_details.performing_clinician IS
    'Name of the clinician who will perform the procedure.';
COMMENT ON COLUMN assessment_procedure_details.performing_clinician_role IS
    'Role or grade of the performing clinician.';
COMMENT ON COLUMN assessment_procedure_details.supervised_by IS
    'Name of the supervising consultant if applicable.';
COMMENT ON COLUMN assessment_procedure_details.additional_procedures IS
    'Any additional procedures to be performed at the same time.';
COMMENT ON COLUMN assessment_procedure_details.procedure_notes IS
    'Additional clinician notes on procedure details.';
