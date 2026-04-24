CREATE TABLE childhood_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,
    dtap_ipv_hib_hepb SMALLINT CHECK (dtap_ipv_hib_hepb IS NULL OR dtap_ipv_hib_hepb BETWEEN 0 AND 2),
    pneumococcal SMALLINT CHECK (pneumococcal IS NULL OR pneumococcal BETWEEN 0 AND 2),
    rotavirus SMALLINT CHECK (rotavirus IS NULL OR rotavirus BETWEEN 0 AND 2),
    meningitis_b SMALLINT CHECK (meningitis_b IS NULL OR meningitis_b BETWEEN 0 AND 2),
    mmr SMALLINT CHECK (mmr IS NULL OR mmr BETWEEN 0 AND 2),
    hib_menc SMALLINT CHECK (hib_menc IS NULL OR hib_menc BETWEEN 0 AND 2),
    preschool_booster SMALLINT CHECK (preschool_booster IS NULL OR preschool_booster BETWEEN 0 AND 2)
);

CREATE TRIGGER trigger_childhood_vaccinations_updated_at
    BEFORE UPDATE ON childhood_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE childhood_vaccinations IS
    'Childhood vaccination status (0=Not Given, 1=Partial, 2=Complete). One-to-one child of assessment.';

COMMENT ON COLUMN childhood_vaccinations.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN childhood_vaccinations.dtap_ipv_hib_hepb IS
    'Dtap ipv hib hepb.';
COMMENT ON COLUMN childhood_vaccinations.pneumococcal IS
    'Pneumococcal.';
COMMENT ON COLUMN childhood_vaccinations.rotavirus IS
    'Rotavirus.';
COMMENT ON COLUMN childhood_vaccinations.meningitis_b IS
    'Meningitis b.';
COMMENT ON COLUMN childhood_vaccinations.mmr IS
    'Mmr.';
COMMENT ON COLUMN childhood_vaccinations.hib_menc IS
    'Hib menc.';
COMMENT ON COLUMN childhood_vaccinations.preschool_booster IS
    'Preschool booster.';
COMMENT ON COLUMN childhood_vaccinations.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN childhood_vaccinations.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN childhood_vaccinations.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN childhood_vaccinations.deleted_at IS
    'Timestamp when this row was deleted.';
