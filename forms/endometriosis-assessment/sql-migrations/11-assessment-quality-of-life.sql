-- 11_assessment_quality_of_life.sql
-- Quality of life impact section of the endometriosis assessment (EHP-30 based).

CREATE TABLE assessment_quality_of_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pain_domain_score INTEGER
        CHECK (pain_domain_score IS NULL OR (pain_domain_score >= 0 AND pain_domain_score <= 100)),
    control_powerlessness_score INTEGER
        CHECK (control_powerlessness_score IS NULL OR (control_powerlessness_score >= 0 AND control_powerlessness_score <= 100)),
    emotional_wellbeing_score INTEGER
        CHECK (emotional_wellbeing_score IS NULL OR (emotional_wellbeing_score >= 0 AND emotional_wellbeing_score <= 100)),
    social_support_score INTEGER
        CHECK (social_support_score IS NULL OR (social_support_score >= 0 AND social_support_score <= 100)),
    self_image_score INTEGER
        CHECK (self_image_score IS NULL OR (self_image_score >= 0 AND self_image_score <= 100)),
    work_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (work_impact IN ('none', 'mild', 'moderate', 'severe', 'unable-to-work', '')),
    relationship_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (relationship_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    sleep_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    mental_health_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mental_health_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    exercise_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (exercise_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    qol_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_quality_of_life_updated_at
    BEFORE UPDATE ON assessment_quality_of_life
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_quality_of_life IS
    'Quality of life impact section: EHP-30 domain scores and functional impact. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_quality_of_life.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_quality_of_life.pain_domain_score IS
    'EHP-30 pain domain score (0-100, higher = worse impact).';
COMMENT ON COLUMN assessment_quality_of_life.control_powerlessness_score IS
    'EHP-30 control and powerlessness domain score (0-100, higher = worse impact).';
COMMENT ON COLUMN assessment_quality_of_life.emotional_wellbeing_score IS
    'EHP-30 emotional well-being domain score (0-100, higher = worse impact).';
COMMENT ON COLUMN assessment_quality_of_life.social_support_score IS
    'EHP-30 social support domain score (0-100, higher = worse impact).';
COMMENT ON COLUMN assessment_quality_of_life.self_image_score IS
    'EHP-30 self-image domain score (0-100, higher = worse impact).';
COMMENT ON COLUMN assessment_quality_of_life.work_impact IS
    'Impact on work or education: none, mild, moderate, severe, unable-to-work, or empty.';
COMMENT ON COLUMN assessment_quality_of_life.relationship_impact IS
    'Impact on relationships: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_quality_of_life.sleep_impact IS
    'Impact on sleep: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_quality_of_life.mental_health_impact IS
    'Impact on mental health: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_quality_of_life.exercise_impact IS
    'Impact on ability to exercise: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_quality_of_life.qol_notes IS
    'Additional clinician notes on quality of life impact.';
