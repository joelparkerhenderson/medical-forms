-- 06_assessment_current_condition.sql
-- Current condition assessment section of the plastic surgery assessment.

CREATE TABLE assessment_current_condition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    condition_category VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (condition_category IN ('skin-lesion', 'soft-tissue-defect', 'skeletal-deformity', 'burn-injury', 'scar-contracture', 'nerve-injury', 'vascular-malformation', 'breast', 'other', '')),
    condition_description TEXT NOT NULL DEFAULT '',
    lesion_size_length_mm INTEGER
        CHECK (lesion_size_length_mm IS NULL OR lesion_size_length_mm >= 0),
    lesion_size_width_mm INTEGER
        CHECK (lesion_size_width_mm IS NULL OR lesion_size_width_mm >= 0),
    lesion_size_depth_mm INTEGER
        CHECK (lesion_size_depth_mm IS NULL OR lesion_size_depth_mm >= 0),
    tissue_loss VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tissue_loss IN ('yes', 'no', '')),
    tissue_loss_percentage NUMERIC(5,1)
        CHECK (tissue_loss_percentage IS NULL OR (tissue_loss_percentage >= 0 AND tissue_loss_percentage <= 100)),
    functional_impairment VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (functional_impairment IN ('none', 'mild', 'moderate', 'severe', '')),
    functional_impairment_details TEXT NOT NULL DEFAULT '',
    pain_level INTEGER
        CHECK (pain_level IS NULL OR (pain_level >= 0 AND pain_level <= 10)),
    cosmetic_concern VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (cosmetic_concern IN ('none', 'mild', 'moderate', 'severe', '')),
    impact_on_daily_activities VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (impact_on_daily_activities IN ('none', 'mild', 'moderate', 'severe', '')),
    current_condition_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_condition_updated_at
    BEFORE UPDATE ON assessment_current_condition
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_condition IS
    'Current condition section: condition category, dimensions, functional impairment, pain, cosmetic concern. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_condition.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_condition.condition_category IS
    'Category of condition: skin-lesion, soft-tissue-defect, skeletal-deformity, burn-injury, scar-contracture, nerve-injury, vascular-malformation, breast, other, or empty.';
COMMENT ON COLUMN assessment_current_condition.lesion_size_length_mm IS
    'Lesion or defect length in millimetres.';
COMMENT ON COLUMN assessment_current_condition.lesion_size_width_mm IS
    'Lesion or defect width in millimetres.';
COMMENT ON COLUMN assessment_current_condition.lesion_size_depth_mm IS
    'Lesion or defect depth in millimetres.';
COMMENT ON COLUMN assessment_current_condition.functional_impairment IS
    'Degree of functional impairment: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_current_condition.pain_level IS
    'Pain level on numeric rating scale 0-10.';
COMMENT ON COLUMN assessment_current_condition.cosmetic_concern IS
    'Degree of cosmetic concern: none, mild, moderate, severe, or empty.';
