-- 06_assessment_clinical_skills.sql
-- Clinical skills competency section of the first responder assessment.

CREATE TABLE assessment_clinical_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    basic_life_support VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (basic_life_support IN ('not-competent', 'developing', 'competent', 'expert', '')),
    advanced_life_support VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (advanced_life_support IN ('not-competent', 'developing', 'competent', 'expert', '')),
    airway_management VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (airway_management IN ('not-competent', 'developing', 'competent', 'expert', '')),
    iv_cannulation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (iv_cannulation IN ('not-competent', 'developing', 'competent', 'expert', '')),
    drug_administration VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (drug_administration IN ('not-competent', 'developing', 'competent', 'expert', '')),
    trauma_assessment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (trauma_assessment IN ('not-competent', 'developing', 'competent', 'expert', '')),
    immobilisation_splinting VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (immobilisation_splinting IN ('not-competent', 'developing', 'competent', 'expert', '')),
    ecg_interpretation VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ecg_interpretation IN ('not-competent', 'developing', 'competent', 'expert', '')),
    patient_assessment VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (patient_assessment IN ('not-competent', 'developing', 'competent', 'expert', '')),
    triage_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (triage_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    paediatric_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (paediatric_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    obstetric_competency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (obstetric_competency IN ('not-competent', 'developing', 'competent', 'expert', '')),
    clinical_skills_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_clinical_skills_updated_at
    BEFORE UPDATE ON assessment_clinical_skills
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_clinical_skills IS
    'Clinical skills competency section: BLS, ALS, airway management, IV access, drug administration, trauma, triage, and specialist areas. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_clinical_skills.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_clinical_skills.basic_life_support IS
    'Basic life support competency level.';
COMMENT ON COLUMN assessment_clinical_skills.advanced_life_support IS
    'Advanced life support competency level.';
COMMENT ON COLUMN assessment_clinical_skills.airway_management IS
    'Airway management competency level.';
COMMENT ON COLUMN assessment_clinical_skills.iv_cannulation IS
    'Intravenous cannulation competency level.';
COMMENT ON COLUMN assessment_clinical_skills.drug_administration IS
    'Drug administration competency level.';
COMMENT ON COLUMN assessment_clinical_skills.trauma_assessment IS
    'Trauma assessment competency level.';
COMMENT ON COLUMN assessment_clinical_skills.immobilisation_splinting IS
    'Immobilisation and splinting competency level.';
COMMENT ON COLUMN assessment_clinical_skills.ecg_interpretation IS
    'ECG interpretation competency level.';
COMMENT ON COLUMN assessment_clinical_skills.patient_assessment IS
    'Systematic patient assessment (ABCDE) competency level.';
COMMENT ON COLUMN assessment_clinical_skills.triage_competency IS
    'Triage competency level.';
COMMENT ON COLUMN assessment_clinical_skills.paediatric_competency IS
    'Paediatric emergency care competency level.';
COMMENT ON COLUMN assessment_clinical_skills.obstetric_competency IS
    'Obstetric emergency care competency level.';
COMMENT ON COLUMN assessment_clinical_skills.clinical_skills_notes IS
    'Additional notes on clinical skills assessment.';
