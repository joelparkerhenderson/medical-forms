-- 12_assessment_functional_impact.sql
-- Functional impact section of the ophthalmology assessment.

CREATE TABLE assessment_functional_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    reading_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (reading_difficulty IN ('none', 'mild', 'moderate', 'severe', 'unable', '')),
    driving_ability VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (driving_ability IN ('drives', 'restricted', 'ceased', 'never-driven', '')),
    dvla_notification_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dvla_notification_required IN ('yes', 'no', '')),
    screen_use_difficulty VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (screen_use_difficulty IN ('none', 'mild', 'moderate', 'severe', '')),
    mobility_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mobility_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    falls_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (falls_risk IN ('yes', 'no', '')),
    work_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (work_impact IN ('no-impact', 'reduced-hours', 'unable-to-work', 'not-applicable', '')),
    daily_living_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (daily_living_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    social_impact VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_impact IN ('none', 'mild', 'moderate', 'severe', '')),
    low_vision_aids_used TEXT NOT NULL DEFAULT '',
    low_vision_referral VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (low_vision_referral IN ('yes', 'no', '')),
    certificate_of_visual_impairment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (certificate_of_visual_impairment IN ('not-applicable', 'sight-impaired', 'severely-sight-impaired', '')),
    functional_impact_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_impact_updated_at
    BEFORE UPDATE ON assessment_functional_impact
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_impact IS
    'Functional impact section: reading, driving, mobility, work, daily living, social impact, and visual impairment registration. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_functional_impact.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_functional_impact.reading_difficulty IS
    'Level of reading difficulty: none, mild, moderate, severe, unable, or empty.';
COMMENT ON COLUMN assessment_functional_impact.driving_ability IS
    'Driving ability: drives, restricted, ceased, never-driven, or empty.';
COMMENT ON COLUMN assessment_functional_impact.dvla_notification_required IS
    'Whether DVLA notification is required due to visual impairment: yes, no, or empty.';
COMMENT ON COLUMN assessment_functional_impact.screen_use_difficulty IS
    'Difficulty using screens (computer, phone, tablet): none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_functional_impact.mobility_impact IS
    'Impact on mobility (navigating, steps, unfamiliar environments): none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_functional_impact.falls_risk IS
    'Whether vision contributes to falls risk: yes, no, or empty.';
COMMENT ON COLUMN assessment_functional_impact.work_impact IS
    'Impact on work: no-impact, reduced-hours, unable-to-work, not-applicable, or empty.';
COMMENT ON COLUMN assessment_functional_impact.daily_living_impact IS
    'Impact on activities of daily living: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_functional_impact.social_impact IS
    'Impact on social activities and interaction: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_functional_impact.low_vision_aids_used IS
    'Low vision aids currently used (magnifiers, CCTV, screen readers).';
COMMENT ON COLUMN assessment_functional_impact.low_vision_referral IS
    'Whether a low vision clinic referral has been made: yes, no, or empty.';
COMMENT ON COLUMN assessment_functional_impact.certificate_of_visual_impairment IS
    'CVI registration status: not-applicable, sight-impaired, severely-sight-impaired, or empty.';
COMMENT ON COLUMN assessment_functional_impact.functional_impact_notes IS
    'Additional clinician notes on functional impact.';
