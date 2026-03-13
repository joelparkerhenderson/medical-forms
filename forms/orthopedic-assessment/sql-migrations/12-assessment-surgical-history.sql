-- 12_assessment_surgical_history.sql
-- Surgical history section of the orthopaedic assessment.

CREATE TABLE assessment_surgical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    has_previous_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (has_previous_surgery IN ('yes', 'no', '')),
    surgery_considered VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (surgery_considered IN ('yes', 'no', '')),
    surgery_considered_details TEXT NOT NULL DEFAULT '',
    patient_preference VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (patient_preference IN ('conservative', 'open-to-surgery', 'prefers-surgery', 'undecided', '')),
    comorbidities_affecting_surgery TEXT NOT NULL DEFAULT '',
    anaesthetic_risk VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anaesthetic_risk IN ('low', 'moderate', 'high', '')),
    anticoagulant_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticoagulant_use IN ('yes', 'no', '')),
    anticoagulant_details TEXT NOT NULL DEFAULT '',
    surgical_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_surgical_history_updated_at
    BEFORE UPDATE ON assessment_surgical_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_surgical_history IS
    'Surgical history section header: previous surgeries, surgical candidacy, and patient preference. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_surgical_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_surgical_history.has_previous_surgery IS
    'Whether the patient has had previous orthopaedic surgery: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.surgery_considered IS
    'Whether surgery is being considered for the current condition: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.surgery_considered_details IS
    'Details of surgery being considered.';
COMMENT ON COLUMN assessment_surgical_history.patient_preference IS
    'Patient preference regarding surgical intervention: conservative, open-to-surgery, prefers-surgery, undecided, or empty.';
COMMENT ON COLUMN assessment_surgical_history.comorbidities_affecting_surgery IS
    'Comorbidities that may affect surgical candidacy.';
COMMENT ON COLUMN assessment_surgical_history.anaesthetic_risk IS
    'Estimated anaesthetic risk: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_surgical_history.anticoagulant_use IS
    'Whether the patient takes anticoagulants: yes, no, or empty.';
COMMENT ON COLUMN assessment_surgical_history.anticoagulant_details IS
    'Details of anticoagulant use.';
COMMENT ON COLUMN assessment_surgical_history.surgical_history_notes IS
    'Additional clinician notes on surgical history and candidacy.';

-- Individual previous surgery items (one-to-many child)
CREATE TABLE assessment_surgery_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    surgical_history_id UUID NOT NULL
        REFERENCES assessment_surgical_history(id) ON DELETE CASCADE,

    procedure_name VARCHAR(255) NOT NULL DEFAULT '',
    date_performed DATE,
    surgeon VARCHAR(255) NOT NULL DEFAULT '',
    hospital VARCHAR(255) NOT NULL DEFAULT '',
    outcome VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (outcome IN ('good', 'fair', 'poor', 'complication', '')),
    outcome_details TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_surgery_item_updated_at
    BEFORE UPDATE ON assessment_surgery_item
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_surgery_item IS
    'Individual previous orthopaedic surgery entry with procedure, date, and outcome.';
COMMENT ON COLUMN assessment_surgery_item.procedure_name IS
    'Name of the surgical procedure.';
COMMENT ON COLUMN assessment_surgery_item.date_performed IS
    'Date the surgery was performed.';
COMMENT ON COLUMN assessment_surgery_item.surgeon IS
    'Name of the operating surgeon.';
COMMENT ON COLUMN assessment_surgery_item.hospital IS
    'Hospital where the surgery was performed.';
COMMENT ON COLUMN assessment_surgery_item.outcome IS
    'Outcome of the surgery: good, fair, poor, complication, or empty.';
COMMENT ON COLUMN assessment_surgery_item.outcome_details IS
    'Details of the surgical outcome.';
COMMENT ON COLUMN assessment_surgery_item.sort_order IS
    'Display order of the item within the list.';
