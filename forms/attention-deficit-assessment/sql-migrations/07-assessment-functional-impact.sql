-- 07_assessment_functional_impact.sql
-- Functional impact section of the attention deficit assessment.

CREATE TABLE assessment_functional_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    impact_on_work VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_work IN ('none', 'mild', 'moderate', 'severe', '')),
    work_impact_details TEXT NOT NULL DEFAULT '',
    impact_on_education VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_education IN ('none', 'mild', 'moderate', 'severe', '')),
    education_impact_details TEXT NOT NULL DEFAULT '',
    impact_on_relationships VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_relationships IN ('none', 'mild', 'moderate', 'severe', '')),
    relationship_impact_details TEXT NOT NULL DEFAULT '',
    impact_on_daily_tasks VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_daily_tasks IN ('none', 'mild', 'moderate', 'severe', '')),
    daily_tasks_impact_details TEXT NOT NULL DEFAULT '',
    impact_on_finances VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_finances IN ('none', 'mild', 'moderate', 'severe', '')),
    impact_on_self_esteem VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (impact_on_self_esteem IN ('none', 'mild', 'moderate', 'severe', '')),
    driving_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (driving_concerns IN ('yes', 'no', '')),
    overall_functional_impairment TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_impact_updated_at
    BEFORE UPDATE ON assessment_functional_impact
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_impact IS
    'Functional impact section: how ADHD symptoms affect work, education, relationships, and daily living. DSM-5 requires impairment in 2+ settings. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_impact.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_impact.impact_on_work IS
    'Degree of impact on work performance: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_impact.work_impact_details IS
    'Details of how ADHD symptoms affect work.';
COMMENT ON COLUMN assessment_functional_impact.impact_on_education IS
    'Degree of impact on education: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_impact.education_impact_details IS
    'Details of how ADHD symptoms affect education.';
COMMENT ON COLUMN assessment_functional_impact.impact_on_relationships IS
    'Degree of impact on relationships: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_impact.relationship_impact_details IS
    'Details of how ADHD symptoms affect relationships.';
COMMENT ON COLUMN assessment_functional_impact.impact_on_daily_tasks IS
    'Degree of impact on daily tasks: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_impact.daily_tasks_impact_details IS
    'Details of how ADHD symptoms affect daily tasks and organisation.';
COMMENT ON COLUMN assessment_functional_impact.impact_on_finances IS
    'Degree of impact on financial management: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_impact.impact_on_self_esteem IS
    'Degree of impact on self-esteem: none, mild, moderate, severe, or empty string if unanswered.';
COMMENT ON COLUMN assessment_functional_impact.driving_concerns IS
    'Whether there are concerns about driving safety related to ADHD symptoms.';
COMMENT ON COLUMN assessment_functional_impact.overall_functional_impairment IS
    'Free-text summary of overall functional impairment across life domains.';
