-- 10_assessment_nutritional_requirements.sql
-- Nutritional requirements section of the nutrition assessment.

CREATE TABLE assessment_nutritional_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    estimated_energy_kcal_per_day INTEGER
        CHECK (estimated_energy_kcal_per_day IS NULL OR estimated_energy_kcal_per_day > 0),
    estimated_protein_g_per_day INTEGER
        CHECK (estimated_protein_g_per_day IS NULL OR estimated_protein_g_per_day > 0),
    estimated_fluid_ml_per_day INTEGER
        CHECK (estimated_fluid_ml_per_day IS NULL OR estimated_fluid_ml_per_day > 0),
    fluid_restriction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fluid_restriction IN ('yes', 'no', '')),
    fluid_restriction_ml INTEGER
        CHECK (fluid_restriction_ml IS NULL OR fluid_restriction_ml > 0),
    electrolyte_monitoring VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (electrolyte_monitoring IN ('yes', 'no', '')),
    refeeding_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (refeeding_risk IN ('yes', 'no', '')),
    refeeding_risk_factors TEXT NOT NULL DEFAULT '',
    micronutrient_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (micronutrient_supplementation IN ('yes', 'no', '')),
    micronutrient_details TEXT NOT NULL DEFAULT '',
    special_requirements TEXT NOT NULL DEFAULT '',
    nutritional_requirements_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_nutritional_requirements_updated_at
    BEFORE UPDATE ON assessment_nutritional_requirements
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_nutritional_requirements IS
    'Nutritional requirements section: estimated energy, protein, fluid needs, refeeding risk, and supplementation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_nutritional_requirements.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_nutritional_requirements.estimated_energy_kcal_per_day IS
    'Estimated daily energy requirement in kilocalories.';
COMMENT ON COLUMN assessment_nutritional_requirements.estimated_protein_g_per_day IS
    'Estimated daily protein requirement in grams.';
COMMENT ON COLUMN assessment_nutritional_requirements.estimated_fluid_ml_per_day IS
    'Estimated daily fluid requirement in millilitres.';
COMMENT ON COLUMN assessment_nutritional_requirements.fluid_restriction IS
    'Whether a fluid restriction is in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_nutritional_requirements.fluid_restriction_ml IS
    'Fluid restriction limit in millilitres per day if applicable.';
COMMENT ON COLUMN assessment_nutritional_requirements.electrolyte_monitoring IS
    'Whether electrolyte monitoring is required: yes, no, or empty.';
COMMENT ON COLUMN assessment_nutritional_requirements.refeeding_risk IS
    'Whether the patient is at risk of refeeding syndrome: yes, no, or empty.';
COMMENT ON COLUMN assessment_nutritional_requirements.refeeding_risk_factors IS
    'Risk factors for refeeding syndrome if identified.';
COMMENT ON COLUMN assessment_nutritional_requirements.micronutrient_supplementation IS
    'Whether micronutrient supplementation is prescribed: yes, no, or empty.';
COMMENT ON COLUMN assessment_nutritional_requirements.micronutrient_details IS
    'Details of micronutrient supplementation.';
COMMENT ON COLUMN assessment_nutritional_requirements.special_requirements IS
    'Any special nutritional requirements (e.g. renal diet, diabetic diet).';
COMMENT ON COLUMN assessment_nutritional_requirements.nutritional_requirements_notes IS
    'Additional clinician notes on nutritional requirements.';
