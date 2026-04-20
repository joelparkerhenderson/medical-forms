-- 08_assessment_immunological.sql
-- Immunological assessment section of the organ donation assessment.

CREATE TABLE assessment_immunological (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hla_typing_completed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hla_typing_completed IN ('yes', 'no', '')),
    hla_a TEXT NOT NULL DEFAULT '',
    hla_b TEXT NOT NULL DEFAULT '',
    hla_dr TEXT NOT NULL DEFAULT '',
    hla_dq TEXT NOT NULL DEFAULT '',
    crossmatch_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (crossmatch_performed IN ('yes', 'no', '')),
    crossmatch_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (crossmatch_result IN ('negative', 'positive', 'pending', '')),
    pra_percentage NUMERIC(5,1)
        CHECK (pra_percentage IS NULL OR (pra_percentage >= 0 AND pra_percentage <= 100)),
    donor_specific_antibodies VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (donor_specific_antibodies IN ('yes', 'no', '')),
    donor_specific_antibodies_details TEXT NOT NULL DEFAULT '',
    abo_compatibility VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (abo_compatibility IN ('compatible', 'incompatible', 'pending', '')),
    immunological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_immunological_updated_at
    BEFORE UPDATE ON assessment_immunological
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_immunological IS
    'Immunological assessment section: HLA typing, crossmatch, PRA, and donor-specific antibodies. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_immunological.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_immunological.hla_typing_completed IS
    'Whether HLA typing has been completed: yes, no, or empty.';
COMMENT ON COLUMN assessment_immunological.hla_a IS
    'HLA-A allele typing result.';
COMMENT ON COLUMN assessment_immunological.hla_b IS
    'HLA-B allele typing result.';
COMMENT ON COLUMN assessment_immunological.hla_dr IS
    'HLA-DR allele typing result.';
COMMENT ON COLUMN assessment_immunological.hla_dq IS
    'HLA-DQ allele typing result.';
COMMENT ON COLUMN assessment_immunological.crossmatch_performed IS
    'Whether crossmatch has been performed: yes, no, or empty.';
COMMENT ON COLUMN assessment_immunological.crossmatch_result IS
    'Crossmatch result: negative (compatible), positive (incompatible), pending, or empty.';
COMMENT ON COLUMN assessment_immunological.pra_percentage IS
    'Panel reactive antibody (PRA) percentage (0-100).';
COMMENT ON COLUMN assessment_immunological.donor_specific_antibodies IS
    'Whether donor-specific antibodies (DSA) are detected: yes, no, or empty.';
COMMENT ON COLUMN assessment_immunological.donor_specific_antibodies_details IS
    'Details of donor-specific antibodies if detected.';
COMMENT ON COLUMN assessment_immunological.abo_compatibility IS
    'ABO blood group compatibility: compatible, incompatible, pending, or empty.';
COMMENT ON COLUMN assessment_immunological.immunological_notes IS
    'Additional clinician notes on immunological assessment.';
