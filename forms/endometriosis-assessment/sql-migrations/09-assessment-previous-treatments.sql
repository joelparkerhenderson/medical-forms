-- 09_assessment_previous_treatments.sql
-- Previous treatments section of the endometriosis assessment.

CREATE TABLE assessment_previous_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    nsaids_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nsaids_tried IN ('yes', 'no', '')),
    nsaids_effective VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (nsaids_effective IN ('effective', 'partially', 'ineffective', '')),
    paracetamol_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (paracetamol_tried IN ('yes', 'no', '')),
    opioids_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (opioids_tried IN ('yes', 'no', '')),
    opioids_current VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (opioids_current IN ('yes', 'no', '')),
    combined_pill_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (combined_pill_tried IN ('yes', 'no', '')),
    combined_pill_effective VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (combined_pill_effective IN ('effective', 'partially', 'ineffective', '')),
    progesterone_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (progesterone_tried IN ('yes', 'no', '')),
    progesterone_type VARCHAR(50) NOT NULL DEFAULT '',
    gnrh_agonist_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (gnrh_agonist_tried IN ('yes', 'no', '')),
    gnrh_agonist_duration_months INTEGER
        CHECK (gnrh_agonist_duration_months IS NULL OR gnrh_agonist_duration_months >= 0),
    mirena_ius_tried VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mirena_ius_tried IN ('yes', 'no', '')),
    other_treatments TEXT NOT NULL DEFAULT '',
    treatment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_previous_treatments_updated_at
    BEFORE UPDATE ON assessment_previous_treatments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_previous_treatments IS
    'Previous treatments section: analgesics, hormonal therapies, and other treatments tried. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_previous_treatments.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_previous_treatments.nsaids_tried IS
    'Whether NSAIDs have been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.nsaids_effective IS
    'Effectiveness of NSAIDs: effective, partially, ineffective, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.paracetamol_tried IS
    'Whether paracetamol has been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.opioids_tried IS
    'Whether opioids have been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.opioids_current IS
    'Whether the patient is currently taking opioids: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.combined_pill_tried IS
    'Whether combined oral contraceptive has been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.combined_pill_effective IS
    'Effectiveness of combined pill: effective, partially, ineffective, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.progesterone_tried IS
    'Whether progesterone-based therapy has been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.progesterone_type IS
    'Type of progesterone treatment tried.';
COMMENT ON COLUMN assessment_previous_treatments.gnrh_agonist_tried IS
    'Whether GnRH agonist therapy has been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.gnrh_agonist_duration_months IS
    'Duration of GnRH agonist treatment in months.';
COMMENT ON COLUMN assessment_previous_treatments.mirena_ius_tried IS
    'Whether Mirena IUS has been tried: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.other_treatments IS
    'Other treatments tried (e.g. physiotherapy, TENS, acupuncture).';
COMMENT ON COLUMN assessment_previous_treatments.treatment_notes IS
    'Additional clinician notes on previous treatments.';
