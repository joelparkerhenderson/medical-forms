-- 06_assessment_medical_history.sql
-- Medical history section of the birth control assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    migraine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (migraine IN ('yes', 'no', '')),
    migraine_with_aura VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (migraine_with_aura IN ('yes', 'no', '')),
    migraine_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (migraine_frequency IN ('rare', 'monthly', 'weekly', '')),
    breast_cancer VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (breast_cancer IN ('current', 'past-5-years', 'past-over-5-years', 'no', '')),
    cervical_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cervical_cancer IN ('yes', 'no', '')),
    liver_disease VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (liver_disease IN ('active-hepatitis', 'cirrhosis', 'liver-tumour', 'no', '')),
    gallbladder_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gallbladder_disease IN ('yes', 'no', '')),
    inflammatory_bowel_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inflammatory_bowel_disease IN ('yes', 'no', '')),
    systemic_lupus_erythematosus VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (systemic_lupus_erythematosus IN ('yes', 'no', '')),
    sle_antiphospholipid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sle_antiphospholipid IN ('yes', 'no', '')),
    epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epilepsy IN ('yes', 'no', '')),
    diabetes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('type-1', 'type-2', 'gestational', 'no', '')),
    diabetes_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes_complications IN ('yes', 'no', '')),
    sexually_transmitted_infection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sexually_transmitted_infection IN ('yes', 'no', '')),
    sti_details TEXT NOT NULL DEFAULT '',
    pelvic_inflammatory_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pelvic_inflammatory_disease IN ('yes', 'no', '')),
    medical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: migraine, cancer, liver disease, autoimmune, diabetes, and STI history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.migraine IS
    'Whether the patient experiences migraines: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.migraine_with_aura IS
    'Whether migraines include aura (UK MEC 4 for COC): yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.migraine_frequency IS
    'Frequency of migraines: rare, monthly, weekly, or empty.';
COMMENT ON COLUMN assessment_medical_history.breast_cancer IS
    'Breast cancer status: current, past-5-years, past-over-5-years, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.cervical_cancer IS
    'Whether the patient has cervical cancer: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.liver_disease IS
    'Liver disease: active-hepatitis, cirrhosis, liver-tumour, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.gallbladder_disease IS
    'Whether the patient has gallbladder disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.inflammatory_bowel_disease IS
    'Whether the patient has inflammatory bowel disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.systemic_lupus_erythematosus IS
    'Whether the patient has SLE: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.sle_antiphospholipid IS
    'Whether the patient with SLE has antiphospholipid antibodies: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.epilepsy IS
    'Whether the patient has epilepsy: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.diabetes IS
    'Diabetes status: type-1, type-2, gestational, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.diabetes_complications IS
    'Whether the patient has diabetic vascular complications: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.sexually_transmitted_infection IS
    'Whether the patient has a current or recent STI: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.sti_details IS
    'Details of STI history.';
COMMENT ON COLUMN assessment_medical_history.pelvic_inflammatory_disease IS
    'Whether the patient has had PID: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.medical_history_notes IS
    'Additional clinician notes on medical history.';
