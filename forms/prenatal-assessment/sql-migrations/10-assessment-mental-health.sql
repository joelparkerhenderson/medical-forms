-- 10_assessment_mental_health.sql
-- Mental health screening section of the prenatal assessment.

CREATE TABLE assessment_mental_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_mental_health_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mental_health_condition IN ('yes', 'no', '')),
    previous_condition_details TEXT NOT NULL DEFAULT '',
    previous_postnatal_depression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_postnatal_depression IN ('yes', 'no', '')),
    current_mood VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (current_mood IN ('good', 'fair', 'low', 'very-low', '')),
    feeling_anxious VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (feeling_anxious IN ('none', 'mild', 'moderate', 'severe', '')),
    phq2_score INTEGER
        CHECK (phq2_score IS NULL OR (phq2_score >= 0 AND phq2_score <= 6)),
    gad2_score INTEGER
        CHECK (gad2_score IS NULL OR (gad2_score >= 0 AND gad2_score <= 6)),
    bonding_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (bonding_concerns IN ('yes', 'no', '')),
    domestic_abuse_screening VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (domestic_abuse_screening IN ('yes', 'no', '')),
    domestic_abuse_disclosed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (domestic_abuse_disclosed IN ('yes', 'no', '')),
    social_support_adequate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (social_support_adequate IN ('yes', 'no', '')),
    self_harm_thoughts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_harm_thoughts IN ('yes', 'no', '')),
    current_mental_health_treatment VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_mental_health_treatment IN ('yes', 'no', '')),
    treatment_details TEXT NOT NULL DEFAULT '',
    referral_needed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (referral_needed IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_mental_health_updated_at
    BEFORE UPDATE ON assessment_mental_health
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_mental_health IS
    'Mental health screening section: mood, anxiety, PHQ-2/GAD-2 scores, domestic abuse screening, and support assessment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_mental_health.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_mental_health.previous_mental_health_condition IS
    'Whether the patient has a history of mental health conditions.';
COMMENT ON COLUMN assessment_mental_health.previous_postnatal_depression IS
    'Whether the patient has had previous postnatal depression.';
COMMENT ON COLUMN assessment_mental_health.current_mood IS
    'Current self-reported mood: good, fair, low, very-low, or empty.';
COMMENT ON COLUMN assessment_mental_health.feeling_anxious IS
    'Current anxiety level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_mental_health.phq2_score IS
    'Patient Health Questionnaire-2 score (0-6) for depression screening.';
COMMENT ON COLUMN assessment_mental_health.gad2_score IS
    'Generalised Anxiety Disorder-2 score (0-6) for anxiety screening.';
COMMENT ON COLUMN assessment_mental_health.bonding_concerns IS
    'Whether there are concerns about maternal-fetal bonding.';
COMMENT ON COLUMN assessment_mental_health.domestic_abuse_screening IS
    'Whether domestic abuse screening was performed.';
COMMENT ON COLUMN assessment_mental_health.domestic_abuse_disclosed IS
    'Whether domestic abuse was disclosed during screening.';
COMMENT ON COLUMN assessment_mental_health.social_support_adequate IS
    'Whether the patient has adequate social support.';
COMMENT ON COLUMN assessment_mental_health.self_harm_thoughts IS
    'Whether the patient is experiencing thoughts of self-harm.';
COMMENT ON COLUMN assessment_mental_health.referral_needed IS
    'Whether a mental health referral is needed.';
