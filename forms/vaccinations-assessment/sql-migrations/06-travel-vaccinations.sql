-- 06_travel_vaccinations.sql
-- Travel vaccinations section (Step 5).

CREATE TABLE travel_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    travel_planned VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (travel_planned IN ('yes', 'no', '')),
    travel_destination VARCHAR(255) NOT NULL DEFAULT '',
    hepatitis_a SMALLINT CHECK (hepatitis_a IS NULL OR hepatitis_a BETWEEN 0 AND 2),
    hepatitis_b SMALLINT CHECK (hepatitis_b IS NULL OR hepatitis_b BETWEEN 0 AND 2),
    typhoid SMALLINT CHECK (typhoid IS NULL OR typhoid BETWEEN 0 AND 2),
    yellow_fever SMALLINT CHECK (yellow_fever IS NULL OR yellow_fever BETWEEN 0 AND 2),
    rabies SMALLINT CHECK (rabies IS NULL OR rabies BETWEEN 0 AND 2),
    japanese_encephalitis SMALLINT CHECK (japanese_encephalitis IS NULL OR japanese_encephalitis BETWEEN 0 AND 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_travel_vaccinations_updated_at
    BEFORE UPDATE ON travel_vaccinations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE travel_vaccinations IS
    'Travel vaccination status and destination information. One-to-one child of assessment.';
