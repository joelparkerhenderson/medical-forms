-- 06_assessment_current_treatment.sql
-- Current treatment section of the oncology assessment.

CREATE TABLE assessment_current_treatment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    treatment_intent VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (treatment_intent IN ('curative', 'palliative', 'adjuvant', 'neoadjuvant', 'maintenance', '')),
    current_regimen VARCHAR(255) NOT NULL DEFAULT '',
    cycle_number INTEGER
        CHECK (cycle_number IS NULL OR cycle_number >= 0),
    total_planned_cycles INTEGER
        CHECK (total_planned_cycles IS NULL OR total_planned_cycles >= 0),
    last_treatment_date DATE,
    next_treatment_date DATE,
    treatment_modifications TEXT NOT NULL DEFAULT '',
    dose_reductions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dose_reductions IN ('yes', 'no', '')),
    dose_reduction_details TEXT NOT NULL DEFAULT '',
    treatment_delays VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (treatment_delays IN ('yes', 'no', '')),
    treatment_delay_details TEXT NOT NULL DEFAULT '',
    current_response VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (current_response IN ('complete-response', 'partial-response', 'stable-disease', 'progressive-disease', 'not-evaluated', '')),
    supportive_care TEXT NOT NULL DEFAULT '',
    current_treatment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_treatment_updated_at
    BEFORE UPDATE ON assessment_current_treatment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_treatment IS
    'Current treatment section: active regimen, cycles, response, and modifications. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_treatment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_treatment.treatment_intent IS
    'Intent of current treatment: curative, palliative, adjuvant, neoadjuvant, maintenance, or empty.';
COMMENT ON COLUMN assessment_current_treatment.current_regimen IS
    'Name of the current chemotherapy or treatment regimen.';
COMMENT ON COLUMN assessment_current_treatment.cycle_number IS
    'Current cycle number in the treatment regimen.';
COMMENT ON COLUMN assessment_current_treatment.total_planned_cycles IS
    'Total number of planned treatment cycles.';
COMMENT ON COLUMN assessment_current_treatment.last_treatment_date IS
    'Date of the most recent treatment administration.';
COMMENT ON COLUMN assessment_current_treatment.next_treatment_date IS
    'Date of the next planned treatment.';
COMMENT ON COLUMN assessment_current_treatment.treatment_modifications IS
    'Description of any modifications to the standard treatment protocol.';
COMMENT ON COLUMN assessment_current_treatment.dose_reductions IS
    'Whether dose reductions have been made: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.dose_reduction_details IS
    'Details of dose reductions and reasons.';
COMMENT ON COLUMN assessment_current_treatment.treatment_delays IS
    'Whether treatment delays have occurred: yes, no, or empty.';
COMMENT ON COLUMN assessment_current_treatment.treatment_delay_details IS
    'Details of treatment delays and reasons.';
COMMENT ON COLUMN assessment_current_treatment.current_response IS
    'Current treatment response: complete-response, partial-response, stable-disease, progressive-disease, not-evaluated, or empty.';
COMMENT ON COLUMN assessment_current_treatment.supportive_care IS
    'Description of supportive care measures in place (e.g. antiemetics, growth factors).';
COMMENT ON COLUMN assessment_current_treatment.current_treatment_notes IS
    'Additional notes on current treatment.';
