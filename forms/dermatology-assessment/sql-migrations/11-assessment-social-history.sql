-- 11_assessment_social_history.sql
-- Step 9: Social history section of the dermatology assessment.

CREATE TABLE assessment_social_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    occupation VARCHAR(255) NOT NULL DEFAULT '',
    occupational_skin_exposure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (occupational_skin_exposure IN ('yes', 'no', '')),
    occupational_exposure_details TEXT NOT NULL DEFAULT '',
    sun_exposure_level VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sun_exposure_level IN ('minimal', 'moderate', 'high', 'very_high', '')),
    sunscreen_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sunscreen_use IN ('always', 'usually', 'sometimes', 'rarely', 'never', '')),
    history_of_sunburn VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_sunburn IN ('yes', 'no', '')),
    sunburn_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sunburn_frequency IN ('rare', 'occasional', 'frequent', '')),
    sunbed_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sunbed_use IN ('yes', 'no', '')),
    skin_type VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (skin_type IN ('i', 'ii', 'iii', 'iv', 'v', 'vi', '')),
    tobacco_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tobacco_use IN ('current', 'former', 'never', '')),
    alcohol_use VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (alcohol_use IN ('none', 'moderate', 'heavy', '')),
    stress_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (stress_level IN ('low', 'moderate', 'high', '')),
    psychological_impact TEXT NOT NULL DEFAULT '',
    hobbies_affecting_skin TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_social_history_updated_at
    BEFORE UPDATE ON assessment_social_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_social_history IS
    'Step 9 Social History: lifestyle factors affecting skin health. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_social_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_social_history.occupation IS
    'Patient occupation (relevant to occupational dermatoses).';
COMMENT ON COLUMN assessment_social_history.occupational_skin_exposure IS
    'Whether the patient has occupational skin irritant or allergen exposure.';
COMMENT ON COLUMN assessment_social_history.occupational_exposure_details IS
    'Details of occupational exposures affecting skin.';
COMMENT ON COLUMN assessment_social_history.sun_exposure_level IS
    'Level of habitual sun exposure.';
COMMENT ON COLUMN assessment_social_history.sunscreen_use IS
    'Frequency of sunscreen application.';
COMMENT ON COLUMN assessment_social_history.history_of_sunburn IS
    'Whether the patient has a history of sunburn (skin cancer risk factor).';
COMMENT ON COLUMN assessment_social_history.sunburn_frequency IS
    'How often the patient has experienced sunburn.';
COMMENT ON COLUMN assessment_social_history.sunbed_use IS
    'Whether the patient uses or has used sunbeds (skin cancer risk factor).';
COMMENT ON COLUMN assessment_social_history.skin_type IS
    'Fitzpatrick skin type classification (I-VI).';
COMMENT ON COLUMN assessment_social_history.tobacco_use IS
    'Tobacco use status (affects skin ageing, wound healing, psoriasis).';
COMMENT ON COLUMN assessment_social_history.alcohol_use IS
    'Alcohol consumption level (affects psoriasis, rosacea).';
COMMENT ON COLUMN assessment_social_history.stress_level IS
    'Self-reported stress level (trigger for eczema, psoriasis flares).';
COMMENT ON COLUMN assessment_social_history.psychological_impact IS
    'Description of psychological impact of the skin condition.';
COMMENT ON COLUMN assessment_social_history.hobbies_affecting_skin IS
    'Hobbies or activities that may affect skin health.';
COMMENT ON COLUMN assessment_social_history.additional_notes IS
    'Additional social history notes.';
