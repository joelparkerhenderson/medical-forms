-- 10_assessment_current_medications.sql
-- Current medications section of the cardiology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    on_antiplatelet VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antiplatelet IN ('yes', 'no', '')),
    antiplatelet_details TEXT NOT NULL DEFAULT '',
    on_anticoagulant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_anticoagulant IN ('yes', 'no', '')),
    anticoagulant_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (anticoagulant_type IN ('warfarin', 'doac', 'lmwh', 'other', '')),
    anticoagulant_details TEXT NOT NULL DEFAULT '',
    on_beta_blocker VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_beta_blocker IN ('yes', 'no', '')),
    beta_blocker_details TEXT NOT NULL DEFAULT '',
    on_ace_inhibitor_arb VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_ace_inhibitor_arb IN ('yes', 'no', '')),
    ace_arb_details TEXT NOT NULL DEFAULT '',
    on_statin VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_statin IN ('yes', 'no', '')),
    statin_details TEXT NOT NULL DEFAULT '',
    on_diuretic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_diuretic IN ('yes', 'no', '')),
    diuretic_details TEXT NOT NULL DEFAULT '',
    on_calcium_channel_blocker VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_calcium_channel_blocker IN ('yes', 'no', '')),
    ccb_details TEXT NOT NULL DEFAULT '',
    on_nitrate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_nitrate IN ('yes', 'no', '')),
    nitrate_details TEXT NOT NULL DEFAULT '',
    other_cardiac_medications TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'moderate', 'poor', '')),
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current cardiac medications section: antiplatelets, anticoagulants, beta blockers, ACE/ARB, statins, and more. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.on_antiplatelet IS
    'Whether the patient is on antiplatelet therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.antiplatelet_details IS
    'Details of antiplatelet therapy (e.g. aspirin 75mg, clopidogrel).';
COMMENT ON COLUMN assessment_current_medications.on_anticoagulant IS
    'Whether the patient is on anticoagulant therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_type IS
    'Type of anticoagulant: warfarin, doac, lmwh, other, or empty.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_details IS
    'Details of anticoagulant therapy including dose and INR target.';
COMMENT ON COLUMN assessment_current_medications.on_beta_blocker IS
    'Whether the patient is on a beta blocker: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.beta_blocker_details IS
    'Details of beta blocker therapy including drug and dose.';
COMMENT ON COLUMN assessment_current_medications.on_ace_inhibitor_arb IS
    'Whether the patient is on an ACE inhibitor or ARB: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.ace_arb_details IS
    'Details of ACE inhibitor or ARB therapy.';
COMMENT ON COLUMN assessment_current_medications.on_statin IS
    'Whether the patient is on a statin: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.statin_details IS
    'Details of statin therapy including drug and dose.';
COMMENT ON COLUMN assessment_current_medications.on_diuretic IS
    'Whether the patient is on a diuretic: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.diuretic_details IS
    'Details of diuretic therapy.';
COMMENT ON COLUMN assessment_current_medications.on_calcium_channel_blocker IS
    'Whether the patient is on a calcium channel blocker: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.ccb_details IS
    'Details of calcium channel blocker therapy.';
COMMENT ON COLUMN assessment_current_medications.on_nitrate IS
    'Whether the patient is on nitrate therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_medications.nitrate_details IS
    'Details of nitrate therapy.';
COMMENT ON COLUMN assessment_current_medications.other_cardiac_medications IS
    'Free-text list of any other cardiac medications.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Self-reported medication adherence: good, moderate, poor, or empty.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Additional clinician notes on medications.';
