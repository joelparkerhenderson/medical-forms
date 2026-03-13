-- 07_assessment_current_medications.sql
-- Current medications section of the asthma assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    uses_saba_reliever VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_saba_reliever IN ('yes', 'no', '')),
    saba_name VARCHAR(255) NOT NULL DEFAULT '',
    saba_frequency VARCHAR(50) NOT NULL DEFAULT '',
    uses_ics_preventer VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_ics_preventer IN ('yes', 'no', '')),
    ics_name VARCHAR(255) NOT NULL DEFAULT '',
    ics_dose VARCHAR(100) NOT NULL DEFAULT '',
    uses_laba VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_laba IN ('yes', 'no', '')),
    laba_name VARCHAR(255) NOT NULL DEFAULT '',
    uses_ltra VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_ltra IN ('yes', 'no', '')),
    ltra_name VARCHAR(255) NOT NULL DEFAULT '',
    uses_biologic VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_biologic IN ('yes', 'no', '')),
    biologic_name VARCHAR(255) NOT NULL DEFAULT '',
    uses_oral_corticosteroid VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (uses_oral_corticosteroid IN ('yes', 'no', '')),
    oral_corticosteroid_details TEXT NOT NULL DEFAULT '',
    inhaler_technique_checked VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (inhaler_technique_checked IN ('yes', 'no', '')),
    adherence_self_rating VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (adherence_self_rating IN ('good', 'moderate', 'poor', '')),
    other_medications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: asthma-specific medications, inhaler technique, and adherence. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.uses_saba_reliever IS
    'Whether the patient uses a short-acting beta-agonist reliever inhaler (e.g. salbutamol).';
COMMENT ON COLUMN assessment_current_medications.saba_name IS
    'Name of the SABA reliever medication.';
COMMENT ON COLUMN assessment_current_medications.saba_frequency IS
    'How often the SABA reliever is used.';
COMMENT ON COLUMN assessment_current_medications.uses_ics_preventer IS
    'Whether the patient uses an inhaled corticosteroid preventer.';
COMMENT ON COLUMN assessment_current_medications.ics_name IS
    'Name of the ICS preventer medication.';
COMMENT ON COLUMN assessment_current_medications.ics_dose IS
    'Dose of the ICS preventer (e.g. 200mcg twice daily).';
COMMENT ON COLUMN assessment_current_medications.uses_laba IS
    'Whether the patient uses a long-acting beta-agonist.';
COMMENT ON COLUMN assessment_current_medications.laba_name IS
    'Name of the LABA medication.';
COMMENT ON COLUMN assessment_current_medications.uses_ltra IS
    'Whether the patient uses a leukotriene receptor antagonist (e.g. montelukast).';
COMMENT ON COLUMN assessment_current_medications.ltra_name IS
    'Name of the LTRA medication.';
COMMENT ON COLUMN assessment_current_medications.uses_biologic IS
    'Whether the patient uses a biologic therapy (e.g. omalizumab, mepolizumab).';
COMMENT ON COLUMN assessment_current_medications.biologic_name IS
    'Name of the biologic therapy.';
COMMENT ON COLUMN assessment_current_medications.uses_oral_corticosteroid IS
    'Whether the patient uses oral corticosteroids for asthma.';
COMMENT ON COLUMN assessment_current_medications.oral_corticosteroid_details IS
    'Details of oral corticosteroid use (dose, frequency, courses per year).';
COMMENT ON COLUMN assessment_current_medications.inhaler_technique_checked IS
    'Whether inhaler technique has been checked.';
COMMENT ON COLUMN assessment_current_medications.adherence_self_rating IS
    'Patient self-rated medication adherence: good, moderate, poor, or empty string if unanswered.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other medications relevant to asthma management.';
