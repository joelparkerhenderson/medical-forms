-- 04_childhood_vaccinations.sql
-- Childhood vaccinations section (Step 3).
-- Each field uses 0 = Not Given, 1 = Partial, 2 = Complete, NULL = unanswered.

CREATE TABLE childhood_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    dtap_ipv_hib_hepb SMALLINT CHECK (dtap_ipv_hib_hepb IS NULL OR dtap_ipv_hib_hepb BETWEEN 0 AND 2),
    pneumococcal SMALLINT CHECK (pneumococcal IS NULL OR pneumococcal BETWEEN 0 AND 2),
    rotavirus SMALLINT CHECK (rotavirus IS NULL OR rotavirus BETWEEN 0 AND 2),
    meningitis_b SMALLINT CHECK (meningitis_b IS NULL OR meningitis_b BETWEEN 0 AND 2),
    mmr SMALLINT CHECK (mmr IS NULL OR mmr BETWEEN 0 AND 2),
    hib_menc SMALLINT CHECK (hib_menc IS NULL OR hib_menc BETWEEN 0 AND 2),
    preschool_booster SMALLINT CHECK (preschool_booster IS NULL OR preschool_booster BETWEEN 0 AND 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_childhood_vaccinations_updated_at
    BEFORE UPDATE ON childhood_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE childhood_vaccinations IS
    'Childhood vaccination status (0=Not Given, 1=Partial, 2=Complete). One-to-one child of assessment.';
