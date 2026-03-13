-- 07_assessment_medical_history.sql
-- Medical history section of the pediatric assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    chronic_conditions TEXT NOT NULL DEFAULT '',
    previous_hospitalizations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_hospitalizations IN ('yes', 'no', '')),
    hospitalization_details TEXT NOT NULL DEFAULT '',
    previous_surgeries VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_surgeries IN ('yes', 'no', '')),
    surgery_details TEXT NOT NULL DEFAULT '',
    known_allergies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_allergies IN ('yes', 'no', '')),
    allergy_details TEXT NOT NULL DEFAULT '',
    congenital_conditions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (congenital_conditions IN ('yes', 'no', '')),
    congenital_condition_details TEXT NOT NULL DEFAULT '',
    hearing_screen_passed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hearing_screen_passed IN ('yes', 'no', '')),
    vision_screen_passed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vision_screen_passed IN ('yes', 'no', '')),
    recurrent_infections VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recurrent_infections IN ('yes', 'no', '')),
    recurrent_infection_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: chronic conditions, hospitalizations, surgeries, allergies, congenital conditions, and screening results. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.chronic_conditions IS
    'Free-text list of any chronic conditions (e.g. asthma, eczema, epilepsy).';
COMMENT ON COLUMN assessment_medical_history.previous_hospitalizations IS
    'Whether the child has had previous hospital admissions.';
COMMENT ON COLUMN assessment_medical_history.hospitalization_details IS
    'Details of previous hospitalizations including reason and duration.';
COMMENT ON COLUMN assessment_medical_history.previous_surgeries IS
    'Whether the child has had any surgeries.';
COMMENT ON COLUMN assessment_medical_history.surgery_details IS
    'Details of previous surgeries.';
COMMENT ON COLUMN assessment_medical_history.known_allergies IS
    'Whether the child has any known allergies.';
COMMENT ON COLUMN assessment_medical_history.allergy_details IS
    'Details of known allergies and reactions.';
COMMENT ON COLUMN assessment_medical_history.congenital_conditions IS
    'Whether the child has any congenital conditions.';
COMMENT ON COLUMN assessment_medical_history.congenital_condition_details IS
    'Details of congenital conditions.';
COMMENT ON COLUMN assessment_medical_history.hearing_screen_passed IS
    'Whether the newborn hearing screen was passed.';
COMMENT ON COLUMN assessment_medical_history.vision_screen_passed IS
    'Whether the vision screening was passed.';
COMMENT ON COLUMN assessment_medical_history.recurrent_infections IS
    'Whether the child experiences recurrent infections.';
