-- 05_assessment_occupational_health.sql
-- Occupational health section of the onboarding assessment.

CREATE TABLE assessment_occupational_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    oh_questionnaire_submitted VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oh_questionnaire_submitted IN ('yes', 'no', '')),
    oh_clearance_received VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oh_clearance_received IN ('yes', 'no', '')),
    oh_clearance_date DATE,
    oh_restrictions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (oh_restrictions IN ('yes', 'no', '')),
    oh_restriction_details TEXT NOT NULL DEFAULT '',
    hepatitis_b_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_status IN ('immune', 'non-immune', 'vaccinating', 'declined', '')),
    tb_screening_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tb_screening_status IN ('not-required', 'required', 'completed', 'referred', '')),
    immunisation_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (immunisation_status IN ('complete', 'incomplete', 'in-progress', '')),
    fit_to_work VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fit_to_work IN ('yes', 'no', '')),
    occupational_health_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_occupational_health_updated_at
    BEFORE UPDATE ON assessment_occupational_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_occupational_health IS
    'Occupational health section: clearance, immunisations, fitness to work. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_occupational_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_occupational_health.oh_questionnaire_submitted IS
    'Whether the occupational health questionnaire has been submitted: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.oh_clearance_received IS
    'Whether occupational health clearance has been received: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.oh_clearance_date IS
    'Date occupational health clearance was received.';
COMMENT ON COLUMN assessment_occupational_health.oh_restrictions IS
    'Whether there are any occupational health restrictions: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.oh_restriction_details IS
    'Details of any occupational health restrictions.';
COMMENT ON COLUMN assessment_occupational_health.hepatitis_b_status IS
    'Hepatitis B immunisation status: immune, non-immune, vaccinating, declined, or empty.';
COMMENT ON COLUMN assessment_occupational_health.tb_screening_status IS
    'TB screening status: not-required, required, completed, referred, or empty.';
COMMENT ON COLUMN assessment_occupational_health.immunisation_status IS
    'Overall immunisation status: complete, incomplete, in-progress, or empty.';
COMMENT ON COLUMN assessment_occupational_health.fit_to_work IS
    'Whether the employee is declared fit to work: yes, no, or empty.';
COMMENT ON COLUMN assessment_occupational_health.occupational_health_notes IS
    'Additional clinician notes on occupational health.';
