-- 09_assessment_current_medications.sql
-- Current medications section of the rheumatology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    currently_on_dmard VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_dmard IN ('yes', 'no', '')),
    dmard_names TEXT NOT NULL DEFAULT '',
    currently_on_biologic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_biologic IN ('yes', 'no', '')),
    biologic_name TEXT NOT NULL DEFAULT '',
    currently_on_corticosteroid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (currently_on_corticosteroid IN ('yes', 'no', '')),
    corticosteroid_dose_mg NUMERIC(5,1)
        CHECK (corticosteroid_dose_mg IS NULL OR corticosteroid_dose_mg >= 0),
    nsaid_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (nsaid_use IN ('yes', 'no', '')),
    nsaid_name TEXT NOT NULL DEFAULT '',
    analgesic_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (analgesic_use IN ('yes', 'no', '')),
    analgesic_details TEXT NOT NULL DEFAULT '',
    folic_acid_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (folic_acid_supplementation IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'partial', 'poor', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: DMARDs, biologics, corticosteroids, NSAIDs, and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.currently_on_dmard IS
    'Whether currently taking DMARDs (e.g. methotrexate, sulfasalazine, hydroxychloroquine).';
COMMENT ON COLUMN assessment_current_medications.dmard_names IS
    'Names and doses of current DMARDs.';
COMMENT ON COLUMN assessment_current_medications.currently_on_biologic IS
    'Whether currently taking a biologic agent (e.g. adalimumab, etanercept, tocilizumab).';
COMMENT ON COLUMN assessment_current_medications.biologic_name IS
    'Name and dose of current biologic agent.';
COMMENT ON COLUMN assessment_current_medications.currently_on_corticosteroid IS
    'Whether currently taking corticosteroids.';
COMMENT ON COLUMN assessment_current_medications.corticosteroid_dose_mg IS
    'Current daily corticosteroid dose in mg prednisolone equivalent.';
COMMENT ON COLUMN assessment_current_medications.nsaid_use IS
    'Whether currently using NSAIDs.';
COMMENT ON COLUMN assessment_current_medications.nsaid_name IS
    'Name and dose of current NSAID.';
COMMENT ON COLUMN assessment_current_medications.analgesic_use IS
    'Whether currently using analgesics beyond NSAIDs.';
COMMENT ON COLUMN assessment_current_medications.analgesic_details IS
    'Details of analgesic use.';
COMMENT ON COLUMN assessment_current_medications.folic_acid_supplementation IS
    'Whether taking folic acid supplementation (common with methotrexate use).';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other current medications.';
COMMENT ON COLUMN assessment_current_medications.medication_adherence IS
    'Self-reported medication adherence: good, partial, poor, or empty string if unanswered.';
