-- 06_assessment_environmental_allergy.sql
-- Environmental allergies section of the assessment.

CREATE TABLE assessment_environmental_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pollen_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pollen_allergy IN ('yes', 'no', '')),
    dust_mite_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dust_mite_allergy IN ('yes', 'no', '')),
    mould_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mould_allergy IN ('yes', 'no', '')),
    animal_dander_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (animal_dander_allergy IN ('yes', 'no', '')),
    latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    insect_sting_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (insect_sting_allergy IN ('yes', 'no', '')),
    insect_sting_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (insect_sting_severity IN ('mild', 'moderate', 'severe', 'anaphylaxis', '')),
    seasonal_pattern VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (seasonal_pattern IN ('perennial', 'spring', 'summer', 'autumn', 'winter', 'multiple', '')),
    other_environmental_allergens TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_environmental_allergies_updated_at
    BEFORE UPDATE ON assessment_environmental_allergies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_environmental_allergies IS
    'Environmental allergies section: pollen, dust mites, mould, animal dander, latex, insect stings. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_environmental_allergies.insect_sting_severity IS
    'Severity of insect sting reactions: mild, moderate, severe, anaphylaxis, or empty.';
COMMENT ON COLUMN assessment_environmental_allergies.seasonal_pattern IS
    'Seasonal pattern of environmental allergies: perennial, spring, summer, autumn, winter, multiple, or empty.';
