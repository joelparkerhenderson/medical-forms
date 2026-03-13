-- 10_assessment_current_medications.sql
-- Current medications section of the neurology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    taking_neurological_medication VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (taking_neurological_medication IN ('yes', 'no', '')),
    anticonvulsants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticonvulsants IN ('yes', 'no', '')),
    anticonvulsant_details TEXT NOT NULL DEFAULT '',
    anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticoagulants IN ('yes', 'no', '')),
    anticoagulant_name VARCHAR(255) NOT NULL DEFAULT '',
    antiplatelets VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antiplatelets IN ('yes', 'no', '')),
    antiplatelet_name VARCHAR(255) NOT NULL DEFAULT '',
    analgesics TEXT NOT NULL DEFAULT '',
    triptans VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (triptans IN ('yes', 'no', '')),
    migraine_prophylaxis TEXT NOT NULL DEFAULT '',
    antihypertensives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antihypertensives IN ('yes', 'no', '')),
    statins VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (statins IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'partial', 'poor', '')),
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: neurological medications, anticoagulants, antiplatelets, and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.taking_neurological_medication IS
    'Whether the patient takes neurological medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.anticonvulsants IS
    'Whether the patient takes anticonvulsant medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.anticonvulsant_details IS
    'Free-text details of anticonvulsant medications (name, dose, levels).';
COMMENT ON COLUMN assessment_current_medications.anticoagulants IS
    'Whether the patient takes anticoagulants: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_name IS
    'Name of anticoagulant (e.g. warfarin, apixaban, rivaroxaban).';
COMMENT ON COLUMN assessment_current_medications.antiplatelets IS
    'Whether the patient takes antiplatelet medication: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.antiplatelet_name IS
    'Name of antiplatelet medication (e.g. aspirin, clopidogrel).';
COMMENT ON COLUMN assessment_current_medications.analgesics IS
    'Free-text details of analgesic medications.';
COMMENT ON COLUMN assessment_current_medications.triptans IS
    'Whether the patient uses triptans for migraine: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.migraine_prophylaxis IS
    'Free-text details of migraine prophylaxis medications.';
COMMENT ON COLUMN assessment_current_medications.antihypertensives IS
    'Whether the patient takes antihypertensive medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.statins IS
    'Whether the patient takes statin medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other medications.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Self-reported medication adherence: good, partial, poor, or empty string.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Free-text clinician notes on medications.';
