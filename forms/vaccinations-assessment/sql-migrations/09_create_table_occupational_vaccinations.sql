CREATE TABLE occupational_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    occupation VARCHAR(255) NOT NULL DEFAULT '',
    healthcare_worker VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (healthcare_worker IN ('yes', 'no', '')),
    hepatitis_b_occupational SMALLINT CHECK (hepatitis_b_occupational IS NULL OR hepatitis_b_occupational BETWEEN 0 AND 2),
    influenza_occupational SMALLINT CHECK (influenza_occupational IS NULL OR influenza_occupational BETWEEN 0 AND 2),
    varicella SMALLINT CHECK (varicella IS NULL OR varicella BETWEEN 0 AND 2),
    bcg_tuberculosis SMALLINT CHECK (bcg_tuberculosis IS NULL OR bcg_tuberculosis BETWEEN 0 AND 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_occupational_vaccinations_updated_at
    BEFORE UPDATE ON occupational_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE occupational_vaccinations IS
    'Occupational vaccination status including healthcare worker screening. One-to-one child of assessment.';

COMMENT ON COLUMN occupational_vaccinations.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN occupational_vaccinations.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN occupational_vaccinations.occupation IS
    'Occupation.';
COMMENT ON COLUMN occupational_vaccinations.healthcare_worker IS
    'Healthcare worker. One of: yes, no.';
COMMENT ON COLUMN occupational_vaccinations.hepatitis_b_occupational IS
    'Hepatitis b occupational.';
COMMENT ON COLUMN occupational_vaccinations.influenza_occupational IS
    'Influenza occupational.';
COMMENT ON COLUMN occupational_vaccinations.varicella IS
    'Varicella.';
COMMENT ON COLUMN occupational_vaccinations.bcg_tuberculosis IS
    'Bcg tuberculosis.';
COMMENT ON COLUMN occupational_vaccinations.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN occupational_vaccinations.updated_at IS
    'Timestamp when this row was last updated.';
