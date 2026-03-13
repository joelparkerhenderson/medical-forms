-- 09_assessment_developmental_history.sql
-- Developmental history section of the autism assessment.

CREATE TABLE assessment_developmental_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    age_first_words_months INTEGER
        CHECK (age_first_words_months IS NULL OR (age_first_words_months >= 0 AND age_first_words_months <= 120)),
    age_first_sentences_months INTEGER
        CHECK (age_first_sentences_months IS NULL OR (age_first_sentences_months >= 0 AND age_first_sentences_months <= 120)),
    speech_delay VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (speech_delay IN ('yes', 'no', '')),
    motor_milestone_delay VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (motor_milestone_delay IN ('yes', 'no', '')),
    motor_milestone_details TEXT NOT NULL DEFAULT '',
    toilet_training_delay VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (toilet_training_delay IN ('yes', 'no', '')),
    educational_support_history TEXT NOT NULL DEFAULT '',
    ehcp_or_statement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (ehcp_or_statement IN ('yes', 'no', '')),
    school_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (school_type IN ('mainstream', 'specialist', 'home-educated', 'other', '')),
    learning_difficulties VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (learning_difficulties IN ('yes', 'no', '')),
    learning_difficulties_details TEXT NOT NULL DEFAULT '',
    developmental_regression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (developmental_regression IN ('yes', 'no', '')),
    developmental_regression_details TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_developmental_history_updated_at
    BEFORE UPDATE ON assessment_developmental_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_developmental_history IS
    'Developmental history section: speech milestones, motor milestones, education, and regression. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_developmental_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_developmental_history.age_first_words_months IS
    'Age in months when the patient spoke first words.';
COMMENT ON COLUMN assessment_developmental_history.age_first_sentences_months IS
    'Age in months when the patient spoke first sentences.';
COMMENT ON COLUMN assessment_developmental_history.speech_delay IS
    'Whether there was a speech or language delay: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.motor_milestone_delay IS
    'Whether there was a delay in motor milestones: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.motor_milestone_details IS
    'Description of motor milestone delays if applicable.';
COMMENT ON COLUMN assessment_developmental_history.toilet_training_delay IS
    'Whether there was a delay in toilet training: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.educational_support_history IS
    'History of educational support received.';
COMMENT ON COLUMN assessment_developmental_history.ehcp_or_statement IS
    'Whether the patient has an EHCP or statement of special educational needs: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.school_type IS
    'Type of school attended: mainstream, specialist, home-educated, other, or empty.';
COMMENT ON COLUMN assessment_developmental_history.learning_difficulties IS
    'Whether the patient has identified learning difficulties: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.learning_difficulties_details IS
    'Description of learning difficulties if applicable.';
COMMENT ON COLUMN assessment_developmental_history.developmental_regression IS
    'Whether the patient experienced developmental regression: yes, no, or empty.';
COMMENT ON COLUMN assessment_developmental_history.developmental_regression_details IS
    'Description of developmental regression if applicable.';
