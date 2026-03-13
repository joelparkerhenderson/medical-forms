-- 07_assessment_anesthesia_information.sql
-- Anesthesia information section of the consent to treatment form.

CREATE TABLE assessment_anesthesia_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    anesthesia_required VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anesthesia_required IN ('yes', 'no', '')),
    anesthesia_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anesthesia_type IN ('general', 'regional', 'local', 'sedation', 'none', '')),
    anesthesia_details TEXT NOT NULL DEFAULT '',
    anesthesia_risks_explained VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anesthesia_risks_explained IN ('yes', 'no', '')),
    anesthesia_specific_risks TEXT NOT NULL DEFAULT '',
    fasting_instructions_given VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (fasting_instructions_given IN ('yes', 'no', '')),
    fasting_from_time VARCHAR(10) NOT NULL DEFAULT '',
    previous_anesthesia_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_anesthesia_problems IN ('yes', 'no', '')),
    previous_anesthesia_problem_details TEXT NOT NULL DEFAULT '',
    family_anesthesia_problems VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (family_anesthesia_problems IN ('yes', 'no', '')),
    family_anesthesia_problem_details TEXT NOT NULL DEFAULT '',
    anesthetist_name VARCHAR(255) NOT NULL DEFAULT '',
    anesthesia_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_anesthesia_information_updated_at
    BEFORE UPDATE ON assessment_anesthesia_information
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_anesthesia_information IS
    'Anesthesia information section: type, risks, fasting, previous problems. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_anesthesia_information.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_anesthesia_information.anesthesia_required IS
    'Whether anesthesia is required for the procedure: yes, no, or empty.';
COMMENT ON COLUMN assessment_anesthesia_information.anesthesia_type IS
    'Type of anesthesia: general, regional, local, sedation, none, or empty.';
COMMENT ON COLUMN assessment_anesthesia_information.anesthesia_details IS
    'Details of the planned anesthesia.';
COMMENT ON COLUMN assessment_anesthesia_information.anesthesia_risks_explained IS
    'Whether anesthesia-specific risks were explained: yes, no, or empty.';
COMMENT ON COLUMN assessment_anesthesia_information.anesthesia_specific_risks IS
    'Details of anesthesia-specific risks discussed.';
COMMENT ON COLUMN assessment_anesthesia_information.fasting_instructions_given IS
    'Whether fasting instructions were given: yes, no, or empty.';
COMMENT ON COLUMN assessment_anesthesia_information.fasting_from_time IS
    'Time from which the patient should fast.';
COMMENT ON COLUMN assessment_anesthesia_information.previous_anesthesia_problems IS
    'Whether the patient has had previous anesthesia problems: yes, no, or empty.';
COMMENT ON COLUMN assessment_anesthesia_information.previous_anesthesia_problem_details IS
    'Details of previous anesthesia problems.';
COMMENT ON COLUMN assessment_anesthesia_information.family_anesthesia_problems IS
    'Whether family members have had anesthesia problems (e.g. malignant hyperthermia): yes, no, or empty.';
COMMENT ON COLUMN assessment_anesthesia_information.family_anesthesia_problem_details IS
    'Details of family anesthesia problems.';
COMMENT ON COLUMN assessment_anesthesia_information.anesthetist_name IS
    'Name of the anesthetist.';
COMMENT ON COLUMN assessment_anesthesia_information.anesthesia_notes IS
    'Additional clinician notes on anesthesia.';
