-- 08_assessment_questions_understanding.sql
-- Questions and understanding section of the consent to treatment form.

CREATE TABLE assessment_questions_understanding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    patient_had_opportunity_to_ask_questions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_had_opportunity_to_ask_questions IN ('yes', 'no', '')),
    patient_questions TEXT NOT NULL DEFAULT '',
    questions_answered_satisfactorily VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (questions_answered_satisfactorily IN ('yes', 'no', '')),
    patient_understands_procedure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_understands_procedure IN ('yes', 'no', '')),
    patient_understands_risks VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_understands_risks IN ('yes', 'no', '')),
    patient_understands_alternatives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (patient_understands_alternatives IN ('yes', 'no', '')),
    information_leaflet_provided VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (information_leaflet_provided IN ('yes', 'no', '')),
    leaflet_reference VARCHAR(100) NOT NULL DEFAULT '',
    additional_information_requested VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (additional_information_requested IN ('yes', 'no', '')),
    additional_information_details TEXT NOT NULL DEFAULT '',
    time_to_consider_given VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (time_to_consider_given IN ('yes', 'no', '')),
    understanding_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_questions_understanding_updated_at
    BEFORE UPDATE ON assessment_questions_understanding
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_questions_understanding IS
    'Questions and understanding section: patient questions, comprehension confirmation, information provided. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_questions_understanding.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_questions_understanding.patient_had_opportunity_to_ask_questions IS
    'Whether the patient had the opportunity to ask questions: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.patient_questions IS
    'Questions raised by the patient.';
COMMENT ON COLUMN assessment_questions_understanding.questions_answered_satisfactorily IS
    'Whether all questions were answered to the patient satisfaction: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.patient_understands_procedure IS
    'Whether the patient demonstrates understanding of the procedure: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.patient_understands_risks IS
    'Whether the patient demonstrates understanding of the risks: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.patient_understands_alternatives IS
    'Whether the patient demonstrates understanding of alternative treatments: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.information_leaflet_provided IS
    'Whether an information leaflet was provided: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.leaflet_reference IS
    'Reference number or title of the information leaflet provided.';
COMMENT ON COLUMN assessment_questions_understanding.additional_information_requested IS
    'Whether the patient requested additional information: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.additional_information_details IS
    'Details of additional information requested.';
COMMENT ON COLUMN assessment_questions_understanding.time_to_consider_given IS
    'Whether the patient was given time to consider the decision: yes, no, or empty.';
COMMENT ON COLUMN assessment_questions_understanding.understanding_notes IS
    'Additional clinician notes on patient understanding.';
