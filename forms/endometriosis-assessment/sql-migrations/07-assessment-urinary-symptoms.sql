-- 07_assessment_urinary_symptoms.sql
-- Urinary symptoms section of the endometriosis assessment.

CREATE TABLE assessment_urinary_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_urinary_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_urinary_symptoms IN ('yes', 'no', '')),
    frequency VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (frequency IN ('yes', 'no', '')),
    urgency VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urgency IN ('yes', 'no', '')),
    dysuria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dysuria IN ('yes', 'no', '')),
    haematuria VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (haematuria IN ('yes', 'no', '')),
    haematuria_cyclical VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (haematuria_cyclical IN ('yes', 'no', '')),
    flank_pain VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (flank_pain IN ('yes', 'no', '')),
    urinary_obstruction_symptoms VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (urinary_obstruction_symptoms IN ('yes', 'no', '')),
    recurrent_utis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recurrent_utis IN ('yes', 'no', '')),
    urinary_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_urinary_symptoms_updated_at
    BEFORE UPDATE ON assessment_urinary_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_urinary_symptoms IS
    'Urinary symptoms section: frequency, urgency, haematuria, obstruction. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_urinary_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_urinary_symptoms.has_urinary_symptoms IS
    'Whether the patient has urinary symptoms: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.frequency IS
    'Increased urinary frequency: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.urgency IS
    'Urinary urgency: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.dysuria IS
    'Pain on urination: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.haematuria IS
    'Blood in urine: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.haematuria_cyclical IS
    'Whether haematuria is cyclical with menstruation: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.flank_pain IS
    'Flank or loin pain: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.urinary_obstruction_symptoms IS
    'Symptoms suggestive of urinary obstruction: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.recurrent_utis IS
    'History of recurrent urinary tract infections: yes, no, or empty.';
COMMENT ON COLUMN assessment_urinary_symptoms.urinary_notes IS
    'Additional clinician notes on urinary symptoms.';
