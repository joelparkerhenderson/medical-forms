-- 10_assessment_current_medications.sql
-- Step 8: Current medications section of the gastroenterology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    takes_ppi VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_ppi IN ('yes', 'no', '')),
    ppi_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_h2_blocker VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_h2_blocker IN ('yes', 'no', '')),
    h2_blocker_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_antacids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antacids IN ('yes', 'no', '')),
    takes_laxatives VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_laxatives IN ('yes', 'no', '')),
    laxative_type VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (laxative_type IN ('osmotic', 'stimulant', 'bulk_forming', 'stool_softener', '')),
    takes_antidiarrhoeals VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antidiarrhoeals IN ('yes', 'no', '')),
    takes_nsaids VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_nsaids IN ('yes', 'no', '')),
    nsaid_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_anticoagulants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_anticoagulants IN ('yes', 'no', '')),
    anticoagulant_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_immunosuppressants VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_immunosuppressants IN ('yes', 'no', '')),
    immunosuppressant_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_biologics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_biologics IN ('yes', 'no', '')),
    biologic_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_antibiotics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_antibiotics IN ('yes', 'no', '')),
    antibiotic_name VARCHAR(255) NOT NULL DEFAULT '',
    takes_probiotics VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (takes_probiotics IN ('yes', 'no', '')),
    other_medications TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Step 8 Current Medications: GI-relevant medications and drug history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.takes_ppi IS
    'Whether the patient takes a proton pump inhibitor.';
COMMENT ON COLUMN assessment_current_medications.ppi_name IS
    'Name of PPI medication (e.g. omeprazole, lansoprazole).';
COMMENT ON COLUMN assessment_current_medications.takes_h2_blocker IS
    'Whether the patient takes an H2 receptor antagonist.';
COMMENT ON COLUMN assessment_current_medications.h2_blocker_name IS
    'Name of H2 blocker medication (e.g. ranitidine, famotidine).';
COMMENT ON COLUMN assessment_current_medications.takes_antacids IS
    'Whether the patient takes antacids.';
COMMENT ON COLUMN assessment_current_medications.takes_laxatives IS
    'Whether the patient takes laxatives.';
COMMENT ON COLUMN assessment_current_medications.laxative_type IS
    'Type of laxative used.';
COMMENT ON COLUMN assessment_current_medications.takes_antidiarrhoeals IS
    'Whether the patient takes antidiarrhoeal medication (e.g. loperamide).';
COMMENT ON COLUMN assessment_current_medications.takes_nsaids IS
    'Whether the patient takes NSAIDs (gastric ulcer and bleeding risk).';
COMMENT ON COLUMN assessment_current_medications.nsaid_name IS
    'Name of NSAID medication.';
COMMENT ON COLUMN assessment_current_medications.takes_anticoagulants IS
    'Whether the patient takes anticoagulants (GI bleeding risk).';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_name IS
    'Name of anticoagulant medication.';
COMMENT ON COLUMN assessment_current_medications.takes_immunosuppressants IS
    'Whether the patient takes immunosuppressants (IBD treatment).';
COMMENT ON COLUMN assessment_current_medications.immunosuppressant_name IS
    'Name of immunosuppressant medication.';
COMMENT ON COLUMN assessment_current_medications.takes_biologics IS
    'Whether the patient takes biologic therapy (IBD treatment).';
COMMENT ON COLUMN assessment_current_medications.biologic_name IS
    'Name of biologic medication.';
COMMENT ON COLUMN assessment_current_medications.takes_antibiotics IS
    'Whether the patient is on antibiotic therapy.';
COMMENT ON COLUMN assessment_current_medications.antibiotic_name IS
    'Name of antibiotic medication.';
COMMENT ON COLUMN assessment_current_medications.takes_probiotics IS
    'Whether the patient takes probiotics.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of all other current medications.';
