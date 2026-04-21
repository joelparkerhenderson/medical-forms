-- 15-assessment-medication.sql
-- Step 13 (medications): clinician-reconciled medication list.
-- Many-to-one child of assessment; the wizard renders a dynamic list.

CREATE TABLE assessment_medication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL
        REFERENCES assessment(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL DEFAULT '',
    dose VARCHAR(100) NOT NULL DEFAULT '',
    route VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (route IN ('oral', 'iv', 'im', 'sc', 'inhaled', 'topical', 'pr', 'other', '')),
    frequency VARCHAR(100) NOT NULL DEFAULT '',
    indication VARCHAR(255) NOT NULL DEFAULT '',
    class VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (class IN ('anticoagulant', 'antiplatelet', 'antihypertensive', 'ace-inhibitor', 'arb', 'beta-blocker', 'diuretic', 'insulin', 'oral-hypoglycaemic', 'steroid', 'opioid', 'benzodiazepine', 'ssri', 'other', '')),
    perioperative_action VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (perioperative_action IN ('continue', 'hold-on-day', 'hold-n-days', 'stop', 'switch', 'bridge', '')),
    perioperative_notes VARCHAR(500) NOT NULL DEFAULT '',
    last_dose_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_medication_assessment_id
    ON assessment_medication(assessment_id);

CREATE TRIGGER trg_assessment_medication_updated_at
    BEFORE UPDATE ON assessment_medication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_medication IS
    'Step 13 medications: clinician-reconciled medication list. Many rows per assessment.';
COMMENT ON COLUMN assessment_medication.assessment_id IS
    'Foreign key to the parent assessment (many-to-one).';
COMMENT ON COLUMN assessment_medication.name IS
    'Medication name (generic preferred).';
COMMENT ON COLUMN assessment_medication.dose IS
    'Dose (e.g. 5 mg).';
COMMENT ON COLUMN assessment_medication.route IS
    'Administration route: oral, iv, im, sc, inhaled, topical, pr, other.';
COMMENT ON COLUMN assessment_medication.frequency IS
    'Dosing frequency (e.g. once daily, BD, PRN).';
COMMENT ON COLUMN assessment_medication.indication IS
    'Indication for the medication.';
COMMENT ON COLUMN assessment_medication.class IS
    'Therapeutic class used to drive perioperative hold rules.';
COMMENT ON COLUMN assessment_medication.perioperative_action IS
    'Perioperative action: continue, hold-on-day, hold-n-days, stop, switch, bridge.';
COMMENT ON COLUMN assessment_medication.perioperative_notes IS
    'Free-text notes on the hold / switch / bridge plan.';
COMMENT ON COLUMN assessment_medication.last_dose_at IS
    'Timestamp of last recorded dose.';
