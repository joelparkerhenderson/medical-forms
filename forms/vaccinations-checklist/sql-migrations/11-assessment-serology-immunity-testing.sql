-- 11_assessment_serology_immunity_testing.sql
-- Serology and immunity testing section of the vaccinations checklist.

CREATE TABLE assessment_serology_immunity_testing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hep_b_surface_antibody VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hep_b_surface_antibody IN ('positive', 'negative', 'not-tested', '')),
    hep_b_surface_antibody_level NUMERIC(8,1)
        CHECK (hep_b_surface_antibody_level IS NULL OR hep_b_surface_antibody_level >= 0),
    hep_b_surface_antibody_date DATE,
    varicella_igg VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (varicella_igg IN ('positive', 'negative', 'equivocal', 'not-tested', '')),
    varicella_igg_date DATE,
    measles_igg VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (measles_igg IN ('positive', 'negative', 'equivocal', 'not-tested', '')),
    measles_igg_date DATE,
    rubella_igg VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (rubella_igg IN ('positive', 'negative', 'equivocal', 'not-tested', '')),
    rubella_igg_date DATE,
    mumps_igg VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mumps_igg IN ('positive', 'negative', 'equivocal', 'not-tested', '')),
    mumps_igg_date DATE,
    hep_a_igg VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hep_a_igg IN ('positive', 'negative', 'not-tested', '')),
    hep_a_igg_date DATE,
    tetanus_antibody VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tetanus_antibody IN ('positive', 'negative', 'not-tested', '')),
    tetanus_antibody_date DATE,
    tb_igra_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (tb_igra_result IN ('positive', 'negative', 'indeterminate', 'not-tested', '')),
    tb_igra_date DATE,
    mantoux_result VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (mantoux_result IN ('positive', 'negative', 'not-tested', '')),
    mantoux_induration_mm INTEGER
        CHECK (mantoux_induration_mm IS NULL OR mantoux_induration_mm >= 0),
    serology_immunity_testing_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_serology_immunity_testing_updated_at
    BEFORE UPDATE ON assessment_serology_immunity_testing
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_serology_immunity_testing IS
    'Serology and immunity testing section: antibody levels for Hep B, varicella, MMR, Hep A, tetanus, TB testing. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_serology_immunity_testing.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_serology_immunity_testing.hep_b_surface_antibody IS
    'Hepatitis B surface antibody result: positive, negative, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.hep_b_surface_antibody_level IS
    'Hepatitis B surface antibody level in mIU/mL (>10 = adequate).';
COMMENT ON COLUMN assessment_serology_immunity_testing.hep_b_surface_antibody_date IS
    'Date of Hepatitis B surface antibody test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.varicella_igg IS
    'Varicella IgG result: positive, negative, equivocal, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.varicella_igg_date IS
    'Date of varicella IgG test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.measles_igg IS
    'Measles IgG result: positive, negative, equivocal, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.measles_igg_date IS
    'Date of measles IgG test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.rubella_igg IS
    'Rubella IgG result: positive, negative, equivocal, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.rubella_igg_date IS
    'Date of rubella IgG test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.mumps_igg IS
    'Mumps IgG result: positive, negative, equivocal, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.mumps_igg_date IS
    'Date of mumps IgG test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.hep_a_igg IS
    'Hepatitis A IgG result: positive, negative, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.hep_a_igg_date IS
    'Date of Hepatitis A IgG test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.tetanus_antibody IS
    'Tetanus antibody result: positive, negative, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.tetanus_antibody_date IS
    'Date of tetanus antibody test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.tb_igra_result IS
    'TB IGRA (Interferon Gamma Release Assay) result: positive, negative, indeterminate, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.tb_igra_date IS
    'Date of TB IGRA test.';
COMMENT ON COLUMN assessment_serology_immunity_testing.mantoux_result IS
    'Mantoux tuberculin skin test result: positive, negative, not-tested, or empty.';
COMMENT ON COLUMN assessment_serology_immunity_testing.mantoux_induration_mm IS
    'Mantoux test induration measurement in millimetres.';
COMMENT ON COLUMN assessment_serology_immunity_testing.serology_immunity_testing_notes IS
    'Additional notes on serology and immunity testing.';
