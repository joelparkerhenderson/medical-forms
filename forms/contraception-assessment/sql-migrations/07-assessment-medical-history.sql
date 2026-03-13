-- 07_assessment_medical_history.sql
-- Medical history section of the contraception assessment.

CREATE TABLE assessment_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    history_of_vte VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_vte IN ('yes', 'no', '')),
    vte_details TEXT NOT NULL DEFAULT '',
    history_of_stroke VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_stroke IN ('yes', 'no', '')),
    history_of_mi VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (history_of_mi IN ('yes', 'no', '')),
    migraine_with_aura VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (migraine_with_aura IN ('yes', 'no', '')),
    migraine_without_aura VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (migraine_without_aura IN ('yes', 'no', '')),
    hypertension VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hypertension IN ('yes', 'no', '')),
    systolic_bp_mmhg INTEGER
        CHECK (systolic_bp_mmhg IS NULL OR (systolic_bp_mmhg >= 50 AND systolic_bp_mmhg <= 300)),
    diastolic_bp_mmhg INTEGER
        CHECK (diastolic_bp_mmhg IS NULL OR (diastolic_bp_mmhg >= 20 AND diastolic_bp_mmhg <= 200)),
    diabetes VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (diabetes IN ('type-1', 'type-2', 'gestational', 'no', '')),
    diabetes_complications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diabetes_complications IN ('yes', 'no', '')),
    liver_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (liver_disease IN ('yes', 'no', '')),
    liver_disease_details TEXT NOT NULL DEFAULT '',
    gallbladder_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gallbladder_disease IN ('yes', 'no', '')),
    breast_cancer VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (breast_cancer IN ('current', 'past', 'family', 'no', '')),
    breast_cancer_details TEXT NOT NULL DEFAULT '',
    cervical_cancer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cervical_cancer IN ('yes', 'no', '')),
    endometriosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (endometriosis IN ('yes', 'no', '')),
    fibroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fibroids IN ('yes', 'no', '')),
    pelvic_inflammatory_disease VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pelvic_inflammatory_disease IN ('yes', 'no', '')),
    sti_history VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sti_history IN ('yes', 'no', '')),
    sti_details TEXT NOT NULL DEFAULT '',
    epilepsy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (epilepsy IN ('yes', 'no', '')),
    epilepsy_medications TEXT NOT NULL DEFAULT '',
    current_medications TEXT NOT NULL DEFAULT '',
    drug_allergies TEXT NOT NULL DEFAULT '',
    medical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_medical_history_updated_at
    BEFORE UPDATE ON assessment_medical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medical_history IS
    'Medical history section: VTE, cardiovascular, migraine, liver, breast cancer, gynaecological conditions, medications. Critical for UKMEC classification. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_medical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_medical_history.history_of_vte IS
    'Whether the patient has a history of venous thromboembolism: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.vte_details IS
    'Details of VTE history.';
COMMENT ON COLUMN assessment_medical_history.history_of_stroke IS
    'Whether the patient has a history of stroke or TIA: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.history_of_mi IS
    'Whether the patient has a history of myocardial infarction: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.migraine_with_aura IS
    'Whether the patient has migraine with aura (UKMEC 4 for CHC): yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.migraine_without_aura IS
    'Whether the patient has migraine without aura: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.hypertension IS
    'Whether the patient has hypertension: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.systolic_bp_mmhg IS
    'Most recent systolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_medical_history.diastolic_bp_mmhg IS
    'Most recent diastolic blood pressure in mmHg.';
COMMENT ON COLUMN assessment_medical_history.diabetes IS
    'Diabetes status: type-1, type-2, gestational, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.diabetes_complications IS
    'Whether there are vascular complications of diabetes: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.liver_disease IS
    'Whether the patient has liver disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.liver_disease_details IS
    'Details of liver disease.';
COMMENT ON COLUMN assessment_medical_history.gallbladder_disease IS
    'Whether the patient has gallbladder disease: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.breast_cancer IS
    'Breast cancer status: current, past (>5 years remission), family (first-degree), no, or empty.';
COMMENT ON COLUMN assessment_medical_history.breast_cancer_details IS
    'Details of breast cancer history.';
COMMENT ON COLUMN assessment_medical_history.cervical_cancer IS
    'Whether the patient has cervical cancer: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.endometriosis IS
    'Whether the patient has endometriosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.fibroids IS
    'Whether the patient has uterine fibroids: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.pelvic_inflammatory_disease IS
    'Whether the patient has a history of PID: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.sti_history IS
    'Whether the patient has a history of STIs: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.sti_details IS
    'Details of STI history.';
COMMENT ON COLUMN assessment_medical_history.epilepsy IS
    'Whether the patient has epilepsy: yes, no, or empty.';
COMMENT ON COLUMN assessment_medical_history.epilepsy_medications IS
    'Details of epilepsy medications (enzyme-inducing anticonvulsants affect contraception).';
COMMENT ON COLUMN assessment_medical_history.current_medications IS
    'List of all current medications.';
COMMENT ON COLUMN assessment_medical_history.drug_allergies IS
    'List of drug allergies.';
COMMENT ON COLUMN assessment_medical_history.medical_history_notes IS
    'Additional clinician notes on medical history.';
