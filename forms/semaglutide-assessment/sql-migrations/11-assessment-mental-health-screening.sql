-- 11_assessment_mental_health_screening.sql
-- Mental health screening section of the semaglutide assessment.

CREATE TABLE assessment_mental_health_screening (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    history_of_depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_depression IN ('yes', 'no', '')),
    current_depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_depression IN ('yes', 'no', '')),
    depression_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (depression_treatment IN ('yes', 'no', '')),
    depression_treatment_details TEXT NOT NULL DEFAULT '',
    history_of_anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_anxiety IN ('yes', 'no', '')),
    current_anxiety VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_anxiety IN ('yes', 'no', '')),
    suicidal_ideation_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (suicidal_ideation_history IN ('yes', 'no', '')),
    current_suicidal_ideation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_suicidal_ideation IN ('yes', 'no', '')),
    history_of_eating_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_eating_disorder IN ('yes', 'no', '')),
    eating_disorder_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (eating_disorder_type IN ('anorexia', 'bulimia', 'binge_eating', 'other', '')),
    eating_disorder_details TEXT NOT NULL DEFAULT '',
    binge_eating_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (binge_eating_current IN ('yes', 'no', '')),
    body_image_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (body_image_concerns IN ('yes', 'no', '')),
    phq2_score INTEGER
        CHECK (phq2_score IS NULL OR (phq2_score >= 0 AND phq2_score <= 6)),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mental_health_screening_updated_at
    BEFORE UPDATE ON assessment_mental_health_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mental_health_screening IS
    'Mental health screening section: mood, suicidality, and eating disorder assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mental_health_screening.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mental_health_screening.history_of_depression IS
    'Whether patient has a history of depression.';
COMMENT ON COLUMN assessment_mental_health_screening.current_depression IS
    'Whether patient is currently experiencing depression.';
COMMENT ON COLUMN assessment_mental_health_screening.depression_treatment IS
    'Whether patient is currently receiving treatment for depression.';
COMMENT ON COLUMN assessment_mental_health_screening.depression_treatment_details IS
    'Details of current depression treatment.';
COMMENT ON COLUMN assessment_mental_health_screening.history_of_anxiety IS
    'Whether patient has a history of anxiety.';
COMMENT ON COLUMN assessment_mental_health_screening.current_anxiety IS
    'Whether patient is currently experiencing anxiety.';
COMMENT ON COLUMN assessment_mental_health_screening.suicidal_ideation_history IS
    'Whether patient has a history of suicidal ideation (GLP-1 RA safety signal under review).';
COMMENT ON COLUMN assessment_mental_health_screening.current_suicidal_ideation IS
    'Whether patient currently has suicidal ideation (requires urgent assessment).';
COMMENT ON COLUMN assessment_mental_health_screening.history_of_eating_disorder IS
    'Whether patient has a history of eating disorder.';
COMMENT ON COLUMN assessment_mental_health_screening.eating_disorder_type IS
    'Type of eating disorder: anorexia, bulimia, binge_eating, other, or empty string.';
COMMENT ON COLUMN assessment_mental_health_screening.eating_disorder_details IS
    'Details of eating disorder history.';
COMMENT ON COLUMN assessment_mental_health_screening.binge_eating_current IS
    'Whether patient currently has binge eating behaviour.';
COMMENT ON COLUMN assessment_mental_health_screening.body_image_concerns IS
    'Whether patient has significant body image concerns.';
COMMENT ON COLUMN assessment_mental_health_screening.phq2_score IS
    'PHQ-2 depression screening score (0-6); score >= 3 warrants further evaluation.';
COMMENT ON COLUMN assessment_mental_health_screening.additional_notes IS
    'Free-text additional mental health notes.';
