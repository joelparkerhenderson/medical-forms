-- 04-assessment-surgery-plan.sql
-- Step 2: planned procedure and surgical urgency.

CREATE TABLE assessment_surgery_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    planned_procedure VARCHAR(500) NOT NULL DEFAULT '',
    surgical_specialty VARCHAR(100) NOT NULL DEFAULT '',
    urgency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (urgency IN ('elective', 'urgent', 'emergency', 'immediate', '')),
    laterality VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (laterality IN ('left', 'right', 'bilateral', 'midline', 'na', '')),
    surgical_severity VARCHAR(15) NOT NULL DEFAULT ''
        CHECK (surgical_severity IN ('minor', 'intermediate', 'major', 'major-plus', '')),
    anticipated_blood_loss_ml INTEGER,
    anticipated_duration_minutes INTEGER,
    consultant_surgeon VARCHAR(255) NOT NULL DEFAULT '',
    planned_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_surgery_plan_updated_at
    BEFORE UPDATE ON assessment_surgery_plan
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_surgery_plan IS
    'Step 2: planned surgical procedure, urgency, and NICE NG45 surgical severity grade.';
COMMENT ON COLUMN assessment_surgery_plan.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_surgery_plan.planned_procedure IS
    'Free-text description of the planned operation.';
COMMENT ON COLUMN assessment_surgery_plan.surgical_specialty IS
    'Surgical specialty: e.g. orthopaedics, general, vascular, ENT.';
COMMENT ON COLUMN assessment_surgery_plan.urgency IS
    'NCEPOD urgency: elective, urgent, emergency, immediate.';
COMMENT ON COLUMN assessment_surgery_plan.laterality IS
    'Laterality of the procedure: left, right, bilateral, midline, na.';
COMMENT ON COLUMN assessment_surgery_plan.surgical_severity IS
    'NICE NG45 surgical severity grade: minor, intermediate, major, major-plus.';
COMMENT ON COLUMN assessment_surgery_plan.anticipated_blood_loss_ml IS
    'Expected intra-operative blood loss in millilitres.';
COMMENT ON COLUMN assessment_surgery_plan.anticipated_duration_minutes IS
    'Expected operative duration in minutes.';
COMMENT ON COLUMN assessment_surgery_plan.consultant_surgeon IS
    'Name of the consultant surgeon responsible.';
COMMENT ON COLUMN assessment_surgery_plan.planned_date IS
    'Planned date of operation.';
