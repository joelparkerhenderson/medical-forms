-- 10_assessment_medical_history.sql
-- Medical history section of the gynaecology assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_endometriosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_endometriosis IN ('yes', 'no', '')),
    endometriosis_details TEXT NOT NULL DEFAULT '',
    has_fibroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_fibroids IN ('yes', 'no', '')),
    fibroid_details TEXT NOT NULL DEFAULT '',
    has_pcos VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_pcos IN ('yes', 'no', '')),
    has_ovarian_cysts VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_ovarian_cysts IN ('yes', 'no', '')),
    ovarian_cyst_details TEXT NOT NULL DEFAULT '',
    previous_gynaecological_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_gynaecological_surgery IN ('yes', 'no', '')),
    gynaecological_surgery_details TEXT NOT NULL DEFAULT '',
    has_thyroid_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_thyroid_disorder IN ('yes', 'no', '')),
    thyroid_details TEXT NOT NULL DEFAULT '',
    has_clotting_disorder VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_clotting_disorder IN ('yes', 'no', '')),
    clotting_disorder_details TEXT NOT NULL DEFAULT '',
    has_autoimmune_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_autoimmune_condition IN ('yes', 'no', '')),
    autoimmune_details TEXT NOT NULL DEFAULT '',
    has_mental_health_condition VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_mental_health_condition IN ('yes', 'no', '')),
    mental_health_details TEXT NOT NULL DEFAULT '',
    other_medical_conditions TEXT NOT NULL DEFAULT '',
    previous_surgeries TEXT NOT NULL DEFAULT '',
    allergies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: gynaecological conditions, surgeries, and general medical history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.has_endometriosis IS
    'Whether the patient has endometriosis: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.endometriosis_details IS
    'Details of endometriosis diagnosis and treatment.';
COMMENT ON COLUMN assessment_medical_history.has_fibroids IS
    'Whether the patient has uterine fibroids: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.fibroid_details IS
    'Details of uterine fibroids.';
COMMENT ON COLUMN assessment_medical_history.has_pcos IS
    'Whether the patient has polycystic ovary syndrome: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.has_ovarian_cysts IS
    'Whether the patient has ovarian cysts: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.ovarian_cyst_details IS
    'Details of ovarian cysts.';
COMMENT ON COLUMN assessment_medical_history.previous_gynaecological_surgery IS
    'Whether previous gynaecological surgery has been performed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.gynaecological_surgery_details IS
    'Details of previous gynaecological surgery.';
COMMENT ON COLUMN assessment_medical_history.has_thyroid_disorder IS
    'Whether the patient has a thyroid disorder: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.thyroid_details IS
    'Details of thyroid disorder.';
COMMENT ON COLUMN assessment_medical_history.has_clotting_disorder IS
    'Whether the patient has a clotting disorder: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.clotting_disorder_details IS
    'Details of clotting disorder.';
COMMENT ON COLUMN assessment_medical_history.has_autoimmune_condition IS
    'Whether the patient has an autoimmune condition: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.autoimmune_details IS
    'Details of autoimmune condition.';
COMMENT ON COLUMN assessment_medical_history.has_mental_health_condition IS
    'Whether the patient has a mental health condition: yes, no, or empty string.';
COMMENT ON COLUMN assessment_medical_history.mental_health_details IS
    'Details of mental health condition.';
COMMENT ON COLUMN assessment_medical_history.other_medical_conditions IS
    'Free-text description of other medical conditions.';
COMMENT ON COLUMN assessment_medical_history.previous_surgeries IS
    'Free-text description of previous non-gynaecological surgeries.';
COMMENT ON COLUMN assessment_medical_history.allergies IS
    'Free-text list of known allergies.';
