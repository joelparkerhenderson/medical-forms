-- 07_assessment_medical_treatment_wishes.sql
-- Medical treatment wishes section of the advance statement about care.

CREATE TABLE assessment_medical_treatment_wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    pain_management_preferences TEXT NOT NULL DEFAULT '',
    attitude_to_hospital_admission TEXT NOT NULL DEFAULT '',
    attitude_to_intensive_care TEXT NOT NULL DEFAULT '',
    attitude_to_artificial_nutrition TEXT NOT NULL DEFAULT '',
    attitude_to_artificial_hydration TEXT NOT NULL DEFAULT '',
    medication_preferences TEXT NOT NULL DEFAULT '',
    complementary_therapy_preferences TEXT NOT NULL DEFAULT '',
    other_treatment_wishes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_treatment_wishes_updated_at
    BEFORE UPDATE ON assessment_medical_treatment_wishes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_treatment_wishes IS
    'Medical treatment wishes section: non-binding preferences about medical interventions and treatments. Unlike an ADRT, these are wishes, not legally binding refusals. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_treatment_wishes.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_treatment_wishes.pain_management_preferences IS
    'Preferences about pain management approaches.';
COMMENT ON COLUMN assessment_medical_treatment_wishes.attitude_to_hospital_admission IS
    'Feelings about being admitted to hospital.';
COMMENT ON COLUMN assessment_medical_treatment_wishes.attitude_to_intensive_care IS
    'Feelings about intensive care treatment.';
COMMENT ON COLUMN assessment_medical_treatment_wishes.attitude_to_artificial_nutrition IS
    'Feelings about artificial nutrition (e.g. PEG feeding).';
COMMENT ON COLUMN assessment_medical_treatment_wishes.attitude_to_artificial_hydration IS
    'Feelings about artificial hydration (e.g. IV fluids).';
COMMENT ON COLUMN assessment_medical_treatment_wishes.medication_preferences IS
    'Preferences about types of medication (e.g. avoidance of certain drugs).';
COMMENT ON COLUMN assessment_medical_treatment_wishes.complementary_therapy_preferences IS
    'Preferences for complementary or alternative therapies.';
COMMENT ON COLUMN assessment_medical_treatment_wishes.other_treatment_wishes IS
    'Any other wishes about medical treatment.';
