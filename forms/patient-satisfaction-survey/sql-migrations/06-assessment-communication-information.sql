-- 06_assessment_communication_information.sql
-- Communication and information section of the patient satisfaction survey.

CREATE TABLE assessment_communication_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    explanation_of_condition INTEGER
        CHECK (explanation_of_condition IS NULL OR (explanation_of_condition >= 1 AND explanation_of_condition <= 5)),
    explanation_of_treatment INTEGER
        CHECK (explanation_of_treatment IS NULL OR (explanation_of_treatment >= 1 AND explanation_of_treatment <= 5)),
    opportunity_to_ask_questions INTEGER
        CHECK (opportunity_to_ask_questions IS NULL OR (opportunity_to_ask_questions >= 1 AND opportunity_to_ask_questions <= 5)),
    listened_to INTEGER
        CHECK (listened_to IS NULL OR (listened_to >= 1 AND listened_to <= 5)),
    informed_about_medication INTEGER
        CHECK (informed_about_medication IS NULL OR (informed_about_medication >= 1 AND informed_about_medication <= 5)),
    written_information_quality INTEGER
        CHECK (written_information_quality IS NULL OR (written_information_quality >= 1 AND written_information_quality <= 5)),
    communication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_communication_information_updated_at
    BEFORE UPDATE ON assessment_communication_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_communication_information IS
    'Communication and information section: explanation quality, questions, and written materials. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_communication_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_communication_information.explanation_of_condition IS
    'Satisfaction with explanation of condition (1-5 Likert).';
COMMENT ON COLUMN assessment_communication_information.explanation_of_treatment IS
    'Satisfaction with explanation of treatment options (1-5 Likert).';
COMMENT ON COLUMN assessment_communication_information.opportunity_to_ask_questions IS
    'Satisfaction with opportunity to ask questions (1-5 Likert).';
COMMENT ON COLUMN assessment_communication_information.listened_to IS
    'Satisfaction with feeling listened to and heard (1-5 Likert).';
COMMENT ON COLUMN assessment_communication_information.informed_about_medication IS
    'Satisfaction with information about medications (1-5 Likert).';
COMMENT ON COLUMN assessment_communication_information.written_information_quality IS
    'Satisfaction with quality of written information provided (1-5 Likert).';
COMMENT ON COLUMN assessment_communication_information.communication_notes IS
    'Additional notes about communication and information.';
