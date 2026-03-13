-- 06_assessment_cardiac_history.sql
-- Cardiac history section of the cardiology assessment.

CREATE TABLE assessment_cardiac_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_mi VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_mi IN ('yes', 'no', '')),
    mi_date DATE,
    mi_details TEXT NOT NULL DEFAULT '',
    previous_pci VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_pci IN ('yes', 'no', '')),
    pci_date DATE,
    pci_details TEXT NOT NULL DEFAULT '',
    previous_cabg VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_cabg IN ('yes', 'no', '')),
    cabg_date DATE,
    cabg_details TEXT NOT NULL DEFAULT '',
    previous_valve_surgery VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_valve_surgery IN ('yes', 'no', '')),
    valve_surgery_details TEXT NOT NULL DEFAULT '',
    known_heart_failure VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_heart_failure IN ('yes', 'no', '')),
    heart_failure_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (heart_failure_type IN ('hfref', 'hfpef', 'hfmref', 'unknown', '')),
    ejection_fraction_percent NUMERIC(4,1)
        CHECK (ejection_fraction_percent IS NULL OR (ejection_fraction_percent >= 0 AND ejection_fraction_percent <= 100)),
    known_cardiomyopathy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (known_cardiomyopathy IN ('yes', 'no', '')),
    cardiomyopathy_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (cardiomyopathy_type IN ('dilated', 'hypertrophic', 'restrictive', 'arrhythmogenic', 'other', '')),
    cardiac_history_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_cardiac_history_updated_at
    BEFORE UPDATE ON assessment_cardiac_history
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_cardiac_history IS
    'Cardiac history section: previous MI, PCI, CABG, valve surgery, heart failure, and cardiomyopathy. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_cardiac_history.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_cardiac_history.previous_mi IS
    'Whether the patient has had a previous myocardial infarction: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.mi_date IS
    'Date of the most recent myocardial infarction.';
COMMENT ON COLUMN assessment_cardiac_history.mi_details IS
    'Details of myocardial infarction history.';
COMMENT ON COLUMN assessment_cardiac_history.previous_pci IS
    'Whether the patient has had percutaneous coronary intervention: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.pci_date IS
    'Date of the most recent PCI.';
COMMENT ON COLUMN assessment_cardiac_history.pci_details IS
    'Details of PCI history including stent type and vessel.';
COMMENT ON COLUMN assessment_cardiac_history.previous_cabg IS
    'Whether the patient has had coronary artery bypass grafting: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.cabg_date IS
    'Date of CABG surgery.';
COMMENT ON COLUMN assessment_cardiac_history.cabg_details IS
    'Details of CABG surgery including number of grafts.';
COMMENT ON COLUMN assessment_cardiac_history.previous_valve_surgery IS
    'Whether the patient has had valve surgery or replacement: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.valve_surgery_details IS
    'Details of valve surgery including valve type and prosthesis.';
COMMENT ON COLUMN assessment_cardiac_history.known_heart_failure IS
    'Whether the patient has known heart failure: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.heart_failure_type IS
    'Type of heart failure: hfref (reduced EF), hfpef (preserved EF), hfmref (mildly reduced EF), unknown, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.ejection_fraction_percent IS
    'Most recent left ventricular ejection fraction as percentage.';
COMMENT ON COLUMN assessment_cardiac_history.known_cardiomyopathy IS
    'Whether the patient has a known cardiomyopathy: yes, no, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.cardiomyopathy_type IS
    'Type of cardiomyopathy: dilated, hypertrophic, restrictive, arrhythmogenic, other, or empty.';
COMMENT ON COLUMN assessment_cardiac_history.cardiac_history_notes IS
    'Additional clinician notes on cardiac history.';
