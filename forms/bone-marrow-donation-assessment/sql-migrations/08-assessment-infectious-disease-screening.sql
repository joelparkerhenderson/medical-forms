-- 08_assessment_infectious_disease_screening.sql
-- Infectious disease screening section of the bone marrow donation assessment.

CREATE TABLE assessment_infectious_disease_screening (
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
    htlv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (htlv_status IN ('negative', 'positive', 'pending', '')),
    syphilis_screen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (syphilis_screen IN ('negative', 'positive', 'pending', '')),
    cmv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cmv_status IN ('negative', 'positive', 'pending', '')),
    ebv_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (ebv_status IN ('negative', 'positive', 'pending', '')),
    toxoplasma_status VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (toxoplasma_status IN ('negative', 'positive', 'pending', '')),
    tuberculosis_screen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tuberculosis_screen IN ('negative', 'positive', 'pending', '')),
    recent_travel VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_travel IN ('yes', 'no', '')),
    travel_details TEXT NOT NULL DEFAULT '',
    recent_infection VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (recent_infection IN ('yes', 'no', '')),
    infection_details TEXT NOT NULL DEFAULT '',
    vaccination_up_to_date VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vaccination_up_to_date IN ('yes', 'no', '')),
    infectious_disease_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_infectious_disease_screening_updated_at
    BEFORE UPDATE ON assessment_infectious_disease_screening
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_infectious_disease_screening IS
    'Infectious disease screening section: viral serology, bacterial screens, travel and exposure history. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_infectious_disease_screening.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_infectious_disease_screening.hiv_status IS
    'HIV 1/2 antigen/antibody screen result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.hepatitis_b_surface_antigen IS
    'Hepatitis B surface antigen (HBsAg) result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.hepatitis_b_core_antibody IS
    'Hepatitis B core antibody (anti-HBc) result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.hepatitis_c_antibody IS
    'Hepatitis C antibody (anti-HCV) result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.htlv_status IS
    'HTLV-I/II antibody screen result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.syphilis_screen IS
    'Syphilis screen (TPHA/RPR) result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.cmv_status IS
    'Cytomegalovirus (CMV) IgG status.';
COMMENT ON COLUMN assessment_infectious_disease_screening.ebv_status IS
    'Epstein-Barr virus (EBV) status.';
COMMENT ON COLUMN assessment_infectious_disease_screening.toxoplasma_status IS
    'Toxoplasma gondii status.';
COMMENT ON COLUMN assessment_infectious_disease_screening.tuberculosis_screen IS
    'Tuberculosis screen (IGRA/Mantoux) result.';
COMMENT ON COLUMN assessment_infectious_disease_screening.recent_travel IS
    'Whether donor has travelled recently to endemic areas: yes, no, or empty.';
COMMENT ON COLUMN assessment_infectious_disease_screening.recent_infection IS
    'Whether donor has had a recent infection: yes, no, or empty.';
COMMENT ON COLUMN assessment_infectious_disease_screening.vaccination_up_to_date IS
    'Whether vaccinations are up to date: yes, no, or empty.';
COMMENT ON COLUMN assessment_infectious_disease_screening.infectious_disease_notes IS
    'Additional clinician notes on infectious disease screening.';
