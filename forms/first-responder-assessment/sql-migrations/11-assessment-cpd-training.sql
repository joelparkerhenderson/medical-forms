-- 11_assessment_cpd_training.sql
-- CPD and training record section of the first responder assessment.

CREATE TABLE assessment_cpd_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    cpd_hours_last_year NUMERIC(6,1)
        CHECK (cpd_hours_last_year IS NULL OR cpd_hours_last_year >= 0),
    cpd_hours_required NUMERIC(6,1)
        CHECK (cpd_hours_required IS NULL OR cpd_hours_required >= 0),
    mandatory_training_complete VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mandatory_training_complete IN ('yes', 'no', '')),
    bls_recertification_date DATE,
    als_recertification_date DATE,
    manual_handling_recertification_date DATE,
    safeguarding_training_date DATE,
    infection_control_training_date DATE,
    major_incident_training VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (major_incident_training IN ('yes', 'no', '')),
    major_incident_training_date DATE,
    mentoring_capability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mentoring_capability IN ('not-competent', 'developing', 'competent', 'expert', '')),
    clinical_supervision_attendance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (clinical_supervision_attendance IN ('yes', 'no', '')),
    reflective_practice VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reflective_practice IN ('not-competent', 'developing', 'competent', 'expert', '')),
    cpd_training_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cpd_training_updated_at
    BEFORE UPDATE ON assessment_cpd_training
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cpd_training IS
    'CPD and training record section: CPD hours, mandatory training, recertification dates, and mentoring. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cpd_training.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cpd_training.cpd_hours_last_year IS
    'Number of CPD hours completed in the last 12 months.';
COMMENT ON COLUMN assessment_cpd_training.cpd_hours_required IS
    'Number of CPD hours required per year.';
COMMENT ON COLUMN assessment_cpd_training.mandatory_training_complete IS
    'Whether all mandatory training is complete: yes, no, or empty.';
COMMENT ON COLUMN assessment_cpd_training.bls_recertification_date IS
    'Date of last BLS recertification.';
COMMENT ON COLUMN assessment_cpd_training.als_recertification_date IS
    'Date of last ALS recertification.';
COMMENT ON COLUMN assessment_cpd_training.manual_handling_recertification_date IS
    'Date of last manual handling recertification.';
COMMENT ON COLUMN assessment_cpd_training.safeguarding_training_date IS
    'Date of last safeguarding training.';
COMMENT ON COLUMN assessment_cpd_training.infection_control_training_date IS
    'Date of last infection control training.';
COMMENT ON COLUMN assessment_cpd_training.major_incident_training IS
    'Whether major incident training has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_cpd_training.major_incident_training_date IS
    'Date of last major incident training.';
COMMENT ON COLUMN assessment_cpd_training.mentoring_capability IS
    'Mentoring capability level.';
COMMENT ON COLUMN assessment_cpd_training.clinical_supervision_attendance IS
    'Whether the responder attends clinical supervision: yes, no, or empty.';
COMMENT ON COLUMN assessment_cpd_training.reflective_practice IS
    'Reflective practice competency level.';
COMMENT ON COLUMN assessment_cpd_training.cpd_training_notes IS
    'Additional notes on CPD and training.';
