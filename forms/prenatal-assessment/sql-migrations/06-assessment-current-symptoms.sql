-- 06_assessment_current_symptoms.sql
-- Current symptoms section of the prenatal assessment.

CREATE TABLE assessment_current_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nausea_vomiting VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (nausea_vomiting IN ('none', 'mild', 'moderate', 'severe', '')),
    hyperemesis_gravidarum VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hyperemesis_gravidarum IN ('yes', 'no', '')),
    vaginal_bleeding VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaginal_bleeding IN ('yes', 'no', '')),
    bleeding_details TEXT NOT NULL DEFAULT '',
    abdominal_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (abdominal_pain IN ('yes', 'no', '')),
    abdominal_pain_details TEXT NOT NULL DEFAULT '',
    headaches VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (headaches IN ('none', 'mild', 'moderate', 'severe', '')),
    visual_disturbances VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (visual_disturbances IN ('yes', 'no', '')),
    oedema VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (oedema IN ('none', 'mild', 'moderate', 'severe', '')),
    oedema_location TEXT NOT NULL DEFAULT '',
    reduced_fetal_movement VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (reduced_fetal_movement IN ('yes', 'no', '')),
    urinary_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urinary_symptoms IN ('yes', 'no', '')),
    urinary_symptom_details TEXT NOT NULL DEFAULT '',
    pelvic_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pelvic_pain IN ('yes', 'no', '')),
    shortness_of_breath VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (shortness_of_breath IN ('yes', 'no', '')),
    additional_symptoms TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_symptoms_updated_at
    BEFORE UPDATE ON assessment_current_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_symptoms IS
    'Current symptoms section: pregnancy-related symptoms including nausea, bleeding, pain, and fetal movement. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_symptoms.nausea_vomiting IS
    'Severity of nausea and vomiting: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_current_symptoms.hyperemesis_gravidarum IS
    'Whether hyperemesis gravidarum has been diagnosed.';
COMMENT ON COLUMN assessment_current_symptoms.vaginal_bleeding IS
    'Whether the patient is experiencing vaginal bleeding.';
COMMENT ON COLUMN assessment_current_symptoms.abdominal_pain IS
    'Whether the patient is experiencing abdominal pain.';
COMMENT ON COLUMN assessment_current_symptoms.headaches IS
    'Severity of headaches: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_current_symptoms.visual_disturbances IS
    'Whether the patient is experiencing visual disturbances (potential preeclampsia sign).';
COMMENT ON COLUMN assessment_current_symptoms.oedema IS
    'Severity of oedema (swelling): none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_current_symptoms.reduced_fetal_movement IS
    'Whether the patient has noticed reduced fetal movement.';
COMMENT ON COLUMN assessment_current_symptoms.urinary_symptoms IS
    'Whether the patient has urinary symptoms (frequency, dysuria).';
COMMENT ON COLUMN assessment_current_symptoms.shortness_of_breath IS
    'Whether the patient is experiencing shortness of breath.';
