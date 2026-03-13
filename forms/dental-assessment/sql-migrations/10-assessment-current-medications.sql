-- 10_assessment_current_medications.sql
-- Step 8: Current medications section of the dental assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_antiplatelet VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antiplatelet IN ('yes', 'no', '')),
    antiplatelet_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_bisphosphonates VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_bisphosphonates IN ('yes', 'no', '')),
    bisphosphonate_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_immunosuppressants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_immunosuppressants IN ('yes', 'no', '')),
    immunosuppressant_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_steroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_steroids IN ('yes', 'no', '')),
    steroid_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_antihypertensives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antihypertensives IN ('yes', 'no', '')),
    antihypertensive_name VARCHAR(255) NOT NULL DEFAULT '',
    local_anaesthetic_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (local_anaesthetic_allergy IN ('yes', 'no', '')),
    anaesthetic_allergy_details TEXT NOT NULL DEFAULT '',
    latex_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (latex_allergy IN ('yes', 'no', '')),
    antibiotic_allergy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antibiotic_allergy IN ('yes', 'no', '')),
    antibiotic_allergy_details TEXT NOT NULL DEFAULT '',
    other_medications TEXT NOT NULL DEFAULT '',
    other_allergies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Step 8 Current Medications: drugs and allergies relevant to dental treatment. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_anticoagulants IS
    'Whether the patient takes anticoagulants (bleeding risk during procedures).';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_name IS
    'Name of anticoagulant medication (e.g. warfarin, rivaroxaban).';
COMMENT ON COLUMN assessment_current_medications.takes_antiplatelet IS
    'Whether the patient takes antiplatelet agents (e.g. aspirin, clopidogrel).';
COMMENT ON COLUMN assessment_current_medications.antiplatelet_name IS
    'Name of antiplatelet medication.';
COMMENT ON COLUMN assessment_current_medications.takes_bisphosphonates IS
    'Whether the patient takes bisphosphonates (MRONJ risk).';
COMMENT ON COLUMN assessment_current_medications.bisphosphonate_name IS
    'Name of bisphosphonate medication.';
COMMENT ON COLUMN assessment_current_medications.takes_immunosuppressants IS
    'Whether the patient takes immunosuppressant drugs.';
COMMENT ON COLUMN assessment_current_medications.immunosuppressant_name IS
    'Name of immunosuppressant medication.';
COMMENT ON COLUMN assessment_current_medications.takes_steroids IS
    'Whether the patient takes systemic steroids (adrenal suppression risk).';
COMMENT ON COLUMN assessment_current_medications.steroid_name IS
    'Name of steroid medication.';
COMMENT ON COLUMN assessment_current_medications.takes_antihypertensives IS
    'Whether the patient takes antihypertensive medication.';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_name IS
    'Name of antihypertensive medication.';
COMMENT ON COLUMN assessment_current_medications.local_anaesthetic_allergy IS
    'Whether the patient has a known allergy to local anaesthetics.';
COMMENT ON COLUMN assessment_current_medications.anaesthetic_allergy_details IS
    'Details of local anaesthetic allergy.';
COMMENT ON COLUMN assessment_current_medications.latex_allergy IS
    'Whether the patient has a latex allergy.';
COMMENT ON COLUMN assessment_current_medications.antibiotic_allergy IS
    'Whether the patient has an antibiotic allergy.';
COMMENT ON COLUMN assessment_current_medications.antibiotic_allergy_details IS
    'Details of antibiotic allergy (e.g. penicillin, amoxicillin).';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of all other current medications.';
COMMENT ON COLUMN assessment_current_medications.other_allergies IS
    'Free-text list of any other known allergies.';
