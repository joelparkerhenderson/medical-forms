-- 11_assessment_current_medications.sql
-- Current medications section of the urology assessment.

CREATE TABLE assessment_current_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    alpha_blocker_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (alpha_blocker_use IN ('yes', 'no', '')),
    alpha_blocker_name TEXT NOT NULL DEFAULT '',
    five_alpha_reductase_inhibitor VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (five_alpha_reductase_inhibitor IN ('yes', 'no', '')),
    five_ari_name TEXT NOT NULL DEFAULT '',
    anticholinergic_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticholinergic_use IN ('yes', 'no', '')),
    anticholinergic_name TEXT NOT NULL DEFAULT '',
    beta3_agonist_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (beta3_agonist_use IN ('yes', 'no', '')),
    beta3_agonist_name TEXT NOT NULL DEFAULT '',
    pde5_inhibitor_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pde5_inhibitor_use IN ('yes', 'no', '')),
    diuretic_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (diuretic_use IN ('yes', 'no', '')),
    diuretic_name TEXT NOT NULL DEFAULT '',
    antihypertensive_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (antihypertensive_use IN ('yes', 'no', '')),
    antihypertensive_details TEXT NOT NULL DEFAULT '',
    anticoagulant_use VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (anticoagulant_use IN ('yes', 'no', '')),
    anticoagulant_name TEXT NOT NULL DEFAULT '',
    other_medications TEXT NOT NULL DEFAULT '',
    known_drug_allergies TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_current_medications_updated_at
    BEFORE UPDATE ON assessment_current_medications
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_current_medications IS
    'Current medications section: urological medications, cardiovascular drugs, and allergies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_current_medications.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_current_medications.alpha_blocker_use IS
    'Whether currently taking an alpha-blocker (e.g. tamsulosin, alfuzosin, doxazosin).';
COMMENT ON COLUMN assessment_current_medications.alpha_blocker_name IS
    'Name and dose of alpha-blocker.';
COMMENT ON COLUMN assessment_current_medications.five_alpha_reductase_inhibitor IS
    'Whether currently taking a 5-alpha reductase inhibitor (e.g. finasteride, dutasteride).';
COMMENT ON COLUMN assessment_current_medications.five_ari_name IS
    'Name and dose of 5-alpha reductase inhibitor.';
COMMENT ON COLUMN assessment_current_medications.anticholinergic_use IS
    'Whether currently taking an anticholinergic for overactive bladder.';
COMMENT ON COLUMN assessment_current_medications.anticholinergic_name IS
    'Name and dose of anticholinergic medication.';
COMMENT ON COLUMN assessment_current_medications.beta3_agonist_use IS
    'Whether currently taking a beta-3 agonist (e.g. mirabegron).';
COMMENT ON COLUMN assessment_current_medications.beta3_agonist_name IS
    'Name and dose of beta-3 agonist.';
COMMENT ON COLUMN assessment_current_medications.pde5_inhibitor_use IS
    'Whether currently taking a PDE5 inhibitor for BPH/LUTS (e.g. tadalafil 5mg daily).';
COMMENT ON COLUMN assessment_current_medications.diuretic_use IS
    'Whether currently taking diuretics (contributes to urinary frequency).';
COMMENT ON COLUMN assessment_current_medications.diuretic_name IS
    'Name and dose of diuretic.';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_use IS
    'Whether currently taking antihypertensive medications.';
COMMENT ON COLUMN assessment_current_medications.antihypertensive_details IS
    'Details of antihypertensive medications.';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_use IS
    'Whether currently taking anticoagulants (relevant for biopsy/surgery planning).';
COMMENT ON COLUMN assessment_current_medications.anticoagulant_name IS
    'Name of anticoagulant.';
COMMENT ON COLUMN assessment_current_medications.other_medications IS
    'Free-text list of other current medications.';
COMMENT ON COLUMN assessment_current_medications.known_drug_allergies IS
    'Known drug allergies.';
