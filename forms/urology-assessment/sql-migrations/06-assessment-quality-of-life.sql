-- 06_assessment_quality_of_life.sql
-- Quality of life section of the urology assessment (IPSS QoL question).

CREATE TABLE assessment_quality_of_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    -- IPSS QoL question (bother score)
    ipss_qol_score INTEGER
        CHECK (ipss_qol_score IS NULL OR (ipss_qol_score >= 0 AND ipss_qol_score <= 6)),

    sleep_disruption_from_nocturia VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sleep_disruption_from_nocturia IN ('none', 'mild', 'moderate', 'severe', '')),
    social_activity_limitation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (social_activity_limitation IN ('none', 'mild', 'moderate', 'severe', '')),
    anxiety_about_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anxiety_about_symptoms IN ('yes', 'no', '')),
    embarrassment_from_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (embarrassment_from_symptoms IN ('yes', 'no', '')),
    travel_restriction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (travel_restriction IN ('yes', 'no', '')),
    fluid_intake_restriction VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fluid_intake_restriction IN ('yes', 'no', '')),
    overall_wellbeing VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (overall_wellbeing IN ('excellent', 'good', 'fair', 'poor', 'very_poor', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_quality_of_life_updated_at
    BEFORE UPDATE ON assessment_quality_of_life
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_quality_of_life IS
    'Quality of life section: IPSS bother score and symptom impact on daily activities. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_quality_of_life.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_quality_of_life.ipss_qol_score IS
    'IPSS QoL: 0=delighted, 1=pleased, 2=mostly satisfied, 3=mixed, 4=mostly dissatisfied, 5=unhappy, 6=terrible.';
COMMENT ON COLUMN assessment_quality_of_life.sleep_disruption_from_nocturia IS
    'Degree of sleep disruption from nocturia: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_quality_of_life.social_activity_limitation IS
    'Degree of social activity limitation: none, mild, moderate, severe, or empty string.';
COMMENT ON COLUMN assessment_quality_of_life.anxiety_about_symptoms IS
    'Whether patient has anxiety about urinary symptoms.';
COMMENT ON COLUMN assessment_quality_of_life.embarrassment_from_symptoms IS
    'Whether patient feels embarrassment from urinary symptoms.';
COMMENT ON COLUMN assessment_quality_of_life.travel_restriction IS
    'Whether urinary symptoms restrict travel.';
COMMENT ON COLUMN assessment_quality_of_life.fluid_intake_restriction IS
    'Whether patient restricts fluid intake due to symptoms.';
COMMENT ON COLUMN assessment_quality_of_life.overall_wellbeing IS
    'Overall sense of wellbeing: excellent, good, fair, poor, very_poor, or empty string.';
