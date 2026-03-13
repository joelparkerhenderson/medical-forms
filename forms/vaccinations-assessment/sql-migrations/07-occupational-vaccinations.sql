-- 07_occupational_vaccinations.sql
-- Occupational vaccinations section (Step 6).

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

CREATE TRIGGER trg_occupational_vaccinations_updated_at
    BEFORE UPDATE ON occupational_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE occupational_vaccinations IS
    'Occupational vaccination status including healthcare worker screening. One-to-one child of assessment.';
