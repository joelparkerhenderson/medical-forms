-- 08_assessment_obstetric_history.sql
-- Obstetric history section of the gynaecology assessment.

CREATE TABLE assessment_obstetric_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    gravida INTEGER
        CHECK (gravida IS NULL OR gravida >= 0),
    para INTEGER
        CHECK (para IS NULL OR para >= 0),
    number_of_miscarriages INTEGER
        CHECK (number_of_miscarriages IS NULL OR number_of_miscarriages >= 0),
    number_of_terminations INTEGER
        CHECK (number_of_terminations IS NULL OR number_of_terminations >= 0),
    number_of_ectopics INTEGER
        CHECK (number_of_ectopics IS NULL OR number_of_ectopics >= 0),
    number_of_stillbirths INTEGER
        CHECK (number_of_stillbirths IS NULL OR number_of_stillbirths >= 0),
    currently_pregnant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_pregnant IN ('yes', 'no', '')),
    gestational_age_weeks INTEGER
        CHECK (gestational_age_weeks IS NULL OR (gestational_age_weeks >= 0 AND gestational_age_weeks <= 45)),
    delivery_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (delivery_complications IN ('yes', 'no', '')),
    delivery_complication_details TEXT NOT NULL DEFAULT '',
    caesarean_section_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (caesarean_section_history IN ('yes', 'no', '')),
    number_of_caesareans INTEGER
        CHECK (number_of_caesareans IS NULL OR number_of_caesareans >= 0),
    gestational_diabetes VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gestational_diabetes IN ('yes', 'no', '')),
    pre_eclampsia VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pre_eclampsia IN ('yes', 'no', '')),
    obstetric_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_obstetric_history_updated_at
    BEFORE UPDATE ON assessment_obstetric_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_obstetric_history IS
    'Obstetric history section: gravida, para, pregnancy losses, and delivery history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_obstetric_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_obstetric_history.gravida IS
    'Total number of pregnancies (gravida), NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.para IS
    'Number of births after 24 weeks gestation (para), NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.number_of_miscarriages IS
    'Number of miscarriages, NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.number_of_terminations IS
    'Number of terminations of pregnancy, NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.number_of_ectopics IS
    'Number of ectopic pregnancies, NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.number_of_stillbirths IS
    'Number of stillbirths, NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.currently_pregnant IS
    'Whether the patient is currently pregnant: yes, no, or empty string.';
COMMENT ON COLUMN assessment_obstetric_history.gestational_age_weeks IS
    'Current gestational age in weeks, NULL if not pregnant.';
COMMENT ON COLUMN assessment_obstetric_history.delivery_complications IS
    'Whether there were delivery complications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_obstetric_history.delivery_complication_details IS
    'Details of delivery complications.';
COMMENT ON COLUMN assessment_obstetric_history.caesarean_section_history IS
    'Whether a previous caesarean section was performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_obstetric_history.number_of_caesareans IS
    'Number of caesarean sections, NULL if unanswered.';
COMMENT ON COLUMN assessment_obstetric_history.gestational_diabetes IS
    'Whether gestational diabetes occurred: yes, no, or empty string.';
COMMENT ON COLUMN assessment_obstetric_history.pre_eclampsia IS
    'Whether pre-eclampsia occurred: yes, no, or empty string.';
COMMENT ON COLUMN assessment_obstetric_history.obstetric_notes IS
    'Free-text notes on obstetric history.';
