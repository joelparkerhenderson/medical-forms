-- 07_assessment_infectious_disease.sql
-- Infectious disease screening section of the organ donation assessment.

CREATE TABLE assessment_infectious_disease (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hiv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hiv_status IN ('negative', 'positive', 'pending', '')),
    hepatitis_b_surface_antigen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_surface_antigen IN ('negative', 'positive', 'pending', '')),
    hepatitis_b_core_antibody VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hepatitis_b_core_antibody IN ('negative', 'positive', 'pending', '')),
    hepatitis_c_antibody VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hepatitis_c_antibody IN ('negative', 'positive', 'pending', '')),
    hepatitis_c_nat VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hepatitis_c_nat IN ('negative', 'positive', 'pending', '')),
    cmv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cmv_status IN ('negative', 'positive', 'pending', '')),
    ebv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ebv_status IN ('negative', 'positive', 'pending', '')),
    syphilis_screen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (syphilis_screen IN ('negative', 'positive', 'pending', '')),
    htlv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (htlv_status IN ('negative', 'positive', 'pending', '')),
    toxoplasma_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (toxoplasma_status IN ('negative', 'positive', 'pending', '')),
    tuberculosis_screen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tuberculosis_screen IN ('negative', 'positive', 'pending', '')),
    mrsa_screen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mrsa_screen IN ('negative', 'positive', 'pending', '')),
    blood_cultures_taken VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (blood_cultures_taken IN ('yes', 'no', '')),
    blood_culture_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (blood_culture_result IN ('negative', 'positive', 'pending', '')),
    blood_culture_organism TEXT NOT NULL DEFAULT '',
    active_infection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (active_infection IN ('yes', 'no', '')),
    active_infection_details TEXT NOT NULL DEFAULT '',
    infectious_disease_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_infectious_disease_updated_at
    BEFORE UPDATE ON assessment_infectious_disease
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_infectious_disease IS
    'Infectious disease screening section: viral, bacterial, and parasitic screening results. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_infectious_disease.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_infectious_disease.hiv_status IS
    'HIV screening result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.hepatitis_b_surface_antigen IS
    'Hepatitis B surface antigen (HBsAg) result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.hepatitis_b_core_antibody IS
    'Hepatitis B core antibody (anti-HBc) result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.hepatitis_c_antibody IS
    'Hepatitis C antibody result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.hepatitis_c_nat IS
    'Hepatitis C nucleic acid test (NAT) result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.cmv_status IS
    'Cytomegalovirus (CMV) IgG status: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.ebv_status IS
    'Epstein-Barr virus (EBV) IgG status: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.syphilis_screen IS
    'Syphilis screening result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.htlv_status IS
    'Human T-lymphotropic virus (HTLV) screening result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.toxoplasma_status IS
    'Toxoplasma IgG status: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.tuberculosis_screen IS
    'Tuberculosis screening result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.mrsa_screen IS
    'MRSA screening result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.blood_cultures_taken IS
    'Whether blood cultures have been taken: yes, no, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.blood_culture_result IS
    'Blood culture result: negative, positive, pending, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.blood_culture_organism IS
    'Organism identified in blood culture if positive.';
COMMENT ON COLUMN assessment_infectious_disease.active_infection IS
    'Whether the donor has an active infection: yes, no, or empty.';
COMMENT ON COLUMN assessment_infectious_disease.active_infection_details IS
    'Details of active infection.';
COMMENT ON COLUMN assessment_infectious_disease.infectious_disease_notes IS
    'Additional clinician notes on infectious disease screening.';
