-- 10_assessment_current_medications.sql
-- Current medications section of the HRT assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_regular_medications VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_regular_medications IN ('yes', 'no', '')),
    current_hrt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (current_hrt IN ('yes', 'no', '')),
    current_hrt_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (current_hrt_type IN ('oestrogen-only', 'combined', 'tibolone', 'local-oestrogen', '')),
    current_hrt_route VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (current_hrt_route IN ('oral', 'transdermal-patch', 'transdermal-gel', 'vaginal', 'implant', '')),
    current_hrt_duration VARCHAR(50) NOT NULL DEFAULT '',
    previous_hrt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_hrt IN ('yes', 'no', '')),
    previous_hrt_details TEXT NOT NULL DEFAULT '',
    reason_for_stopping_hrt TEXT NOT NULL DEFAULT '',
    takes_herbal_supplements VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_herbal_supplements IN ('yes', 'no', '')),
    herbal_supplement_details TEXT NOT NULL DEFAULT '',
    takes_anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_details TEXT NOT NULL DEFAULT '',
    medication_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Individual medication entries (one-to-many child)
CREATE TABLE assessment_current_medication_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    current_medications_id UUID NOT NULL
        REFERENCES assessment_current_medications(id) ON DELETE CASCADE,

    medication_name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    indication VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medication_item_updated_at
    BEFORE UPDATE ON assessment_current_medication_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: HRT status, regular medications, herbal supplements, and anticoagulants. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_regular_medications IS
    'Whether the patient takes regular prescription medications: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.current_hrt IS
    'Whether the patient is currently taking HRT: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.current_hrt_type IS
    'Current HRT type: oestrogen-only, combined, tibolone, local-oestrogen, or empty string.';
COMMENT ON COLUMN assessment_current_medications.current_hrt_route IS
    'Current HRT route: oral, transdermal-patch, transdermal-gel, vaginal, implant, or empty string.';
COMMENT ON COLUMN assessment_current_medications.current_hrt_duration IS
    'Duration of current HRT use (e.g. 6 months, 2 years).';
COMMENT ON COLUMN assessment_current_medications.previous_hrt IS
    'Whether the patient has previously taken HRT: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.previous_hrt_details IS
    'Details of previous HRT use.';
COMMENT ON COLUMN assessment_current_medications.reason_for_stopping_hrt IS
    'Reason for stopping previous HRT.';
COMMENT ON COLUMN assessment_current_medications.takes_herbal_supplements IS
    'Whether the patient takes herbal or alternative remedies: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.herbal_supplement_details IS
    'Details of herbal supplements (e.g. black cohosh, red clover).';
COMMENT ON COLUMN assessment_current_medications.takes_anticoagulants IS
    'Whether the patient takes anticoagulants: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_details IS
    'Details of anticoagulant therapy.';
COMMENT ON COLUMN assessment_current_medications.medication_notes IS
    'Free-text notes on medications.';
COMMENT ON TABLE assessment_current_medication_item IS
    'Individual medication entry within the current medications section.';
COMMENT ON COLUMN assessment_current_medication_item.medication_name IS
    'Name of the medication.';
COMMENT ON COLUMN assessment_current_medication_item.dose IS
    'Dose and strength.';
COMMENT ON COLUMN assessment_current_medication_item.frequency IS
    'Dosing frequency.';
COMMENT ON COLUMN assessment_current_medication_item.indication IS
    'Clinical indication for the medication.';
COMMENT ON COLUMN assessment_current_medication_item.sort_order IS
    'Display order within the medication list.';
