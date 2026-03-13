-- 12_assessment_current_treatment.sql
-- Current treatment section of the MCAS assessment.

CREATE TABLE assessment_current_treatment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    h1_antihistamine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (h1_antihistamine IN ('yes', 'no', '')),
    h1_antihistamine_name VARCHAR(255) NOT NULL DEFAULT '',
    h1_antihistamine_dose VARCHAR(100) NOT NULL DEFAULT '',
    h2_antihistamine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (h2_antihistamine IN ('yes', 'no', '')),
    h2_antihistamine_name VARCHAR(255) NOT NULL DEFAULT '',
    h2_antihistamine_dose VARCHAR(100) NOT NULL DEFAULT '',
    mast_cell_stabiliser VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mast_cell_stabiliser IN ('yes', 'no', '')),
    mast_cell_stabiliser_name VARCHAR(255) NOT NULL DEFAULT '',
    leukotriene_inhibitor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (leukotriene_inhibitor IN ('yes', 'no', '')),
    leukotriene_inhibitor_name VARCHAR(255) NOT NULL DEFAULT '',
    corticosteroids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (corticosteroids IN ('yes', 'no', '')),
    corticosteroid_details TEXT NOT NULL DEFAULT '',
    adrenaline_auto_injector_prescribed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (adrenaline_auto_injector_prescribed IN ('yes', 'no', '')),
    omalizumab VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (omalizumab IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',
    low_histamine_diet VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (low_histamine_diet IN ('yes', 'no', '')),
    avoidance_strategies TEXT NOT NULL DEFAULT '',
    treatment_effectiveness VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (treatment_effectiveness IN ('very-effective', 'somewhat-effective', 'not-effective', '')),
    treatment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_treatment_updated_at
    BEFORE UPDATE ON assessment_current_treatment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_treatment IS
    'Current treatment section: antihistamines, mast cell stabilisers, leukotriene inhibitors, and other MCAS therapies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_treatment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_treatment.h1_antihistamine IS
    'Whether the patient takes an H1 antihistamine: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.h1_antihistamine_name IS
    'Name of the H1 antihistamine (e.g. cetirizine, fexofenadine).';
COMMENT ON COLUMN assessment_current_treatment.h1_antihistamine_dose IS
    'Dose and frequency of the H1 antihistamine.';
COMMENT ON COLUMN assessment_current_treatment.h2_antihistamine IS
    'Whether the patient takes an H2 antihistamine: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.h2_antihistamine_name IS
    'Name of the H2 antihistamine (e.g. famotidine, ranitidine).';
COMMENT ON COLUMN assessment_current_treatment.h2_antihistamine_dose IS
    'Dose and frequency of the H2 antihistamine.';
COMMENT ON COLUMN assessment_current_treatment.mast_cell_stabiliser IS
    'Whether the patient takes a mast cell stabiliser: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.mast_cell_stabiliser_name IS
    'Name of the mast cell stabiliser (e.g. sodium cromoglicate, ketotifen).';
COMMENT ON COLUMN assessment_current_treatment.leukotriene_inhibitor IS
    'Whether the patient takes a leukotriene receptor antagonist: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.leukotriene_inhibitor_name IS
    'Name of the leukotriene inhibitor (e.g. montelukast).';
COMMENT ON COLUMN assessment_current_treatment.corticosteroids IS
    'Whether the patient uses corticosteroids: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.corticosteroid_details IS
    'Free-text details of corticosteroid use (name, dose, route, duration).';
COMMENT ON COLUMN assessment_current_treatment.adrenaline_auto_injector_prescribed IS
    'Whether an adrenaline auto-injector has been prescribed: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.omalizumab IS
    'Whether the patient receives omalizumab (anti-IgE therapy): yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.other_medications IS
    'Free-text list of other medications relevant to MCAS management.';
COMMENT ON COLUMN assessment_current_treatment.low_histamine_diet IS
    'Whether the patient follows a low-histamine diet: yes, no, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.avoidance_strategies IS
    'Free-text description of trigger avoidance strategies in use.';
COMMENT ON COLUMN assessment_current_treatment.treatment_effectiveness IS
    'Overall perceived treatment effectiveness: very-effective, somewhat-effective, not-effective, or empty string.';
COMMENT ON COLUMN assessment_current_treatment.treatment_notes IS
    'Free-text clinician notes on treatment plan and outcomes.';
