-- 05_adult_vaccinations.sql
-- Adult vaccinations section (Step 4).
-- Each field uses 0 = Not Given, 1 = Partial, 2 = Complete, NULL = unanswered.

CREATE TABLE adult_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    td_ipv_booster SMALLINT CHECK (td_ipv_booster IS NULL OR td_ipv_booster BETWEEN 0 AND 2),
    hpv SMALLINT CHECK (hpv IS NULL OR hpv BETWEEN 0 AND 2),
    meningitis_acwy SMALLINT CHECK (meningitis_acwy IS NULL OR meningitis_acwy BETWEEN 0 AND 2),
    influenza_annual SMALLINT CHECK (influenza_annual IS NULL OR influenza_annual BETWEEN 0 AND 2),
    covid19 SMALLINT CHECK (covid19 IS NULL OR covid19 BETWEEN 0 AND 2),
    shingles SMALLINT CHECK (shingles IS NULL OR shingles BETWEEN 0 AND 2),
    pneumococcal_ppv SMALLINT CHECK (pneumococcal_ppv IS NULL OR pneumococcal_ppv BETWEEN 0 AND 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_adult_vaccinations_updated_at
    BEFORE UPDATE ON adult_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE adult_vaccinations IS
    'Adult vaccination status (0=Not Given, 1=Partial, 2=Complete). One-to-one child of assessment.';
