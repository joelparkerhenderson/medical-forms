-- 07_assessment_travel_vaccines.sql
-- Travel vaccines section of the vaccinations checklist.

CREATE TABLE assessment_travel_vaccines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    travel_planned VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (travel_planned IN ('yes', 'no', '')),
    travel_destination VARCHAR(255) NOT NULL DEFAULT '',
    travel_departure_date DATE,
    travel_return_date DATE,
    yellow_fever_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (yellow_fever_vaccine IN ('yes', 'no', 'unknown', '')),
    yellow_fever_vaccine_date DATE,
    yellow_fever_certificate VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (yellow_fever_certificate IN ('yes', 'no', '')),
    japanese_encephalitis_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (japanese_encephalitis_vaccine IN ('yes', 'no', 'unknown', '')),
    japanese_encephalitis_date DATE,
    tick_borne_encephalitis_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (tick_borne_encephalitis_vaccine IN ('yes', 'no', 'unknown', '')),
    tick_borne_encephalitis_date DATE,
    cholera_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cholera_vaccine IN ('yes', 'no', 'unknown', '')),
    cholera_vaccine_date DATE,
    meningococcal_acwy_travel VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (meningococcal_acwy_travel IN ('yes', 'no', 'unknown', '')),
    meningococcal_acwy_travel_date DATE,
    malaria_prophylaxis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (malaria_prophylaxis IN ('yes', 'no', 'not-required', '')),
    malaria_prophylaxis_drug VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (malaria_prophylaxis_drug IN ('atovaquone-proguanil', 'doxycycline', 'mefloquine', 'chloroquine', 'other', '')),
    travel_vaccines_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_travel_vaccines_updated_at
    BEFORE UPDATE ON assessment_travel_vaccines
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_travel_vaccines IS
    'Travel vaccines section: destination, yellow fever, Japanese encephalitis, TBE, cholera, malaria prophylaxis. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_travel_vaccines.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_travel_vaccines.travel_planned IS
    'Whether international travel is planned: yes, no, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.travel_destination IS
    'Planned travel destination country or region.';
COMMENT ON COLUMN assessment_travel_vaccines.travel_departure_date IS
    'Planned departure date.';
COMMENT ON COLUMN assessment_travel_vaccines.travel_return_date IS
    'Planned return date.';
COMMENT ON COLUMN assessment_travel_vaccines.yellow_fever_vaccine IS
    'Whether yellow fever vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.yellow_fever_vaccine_date IS
    'Date yellow fever vaccine was administered.';
COMMENT ON COLUMN assessment_travel_vaccines.yellow_fever_certificate IS
    'Whether International Certificate of Vaccination is held: yes, no, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.japanese_encephalitis_vaccine IS
    'Whether Japanese encephalitis vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.japanese_encephalitis_date IS
    'Date Japanese encephalitis vaccine was administered.';
COMMENT ON COLUMN assessment_travel_vaccines.tick_borne_encephalitis_vaccine IS
    'Whether tick-borne encephalitis vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.tick_borne_encephalitis_date IS
    'Date TBE vaccine was administered.';
COMMENT ON COLUMN assessment_travel_vaccines.cholera_vaccine IS
    'Whether cholera oral vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.cholera_vaccine_date IS
    'Date cholera vaccine was administered.';
COMMENT ON COLUMN assessment_travel_vaccines.meningococcal_acwy_travel IS
    'Whether meningococcal ACWY vaccine has been received for travel: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.meningococcal_acwy_travel_date IS
    'Date meningococcal ACWY travel vaccine was administered.';
COMMENT ON COLUMN assessment_travel_vaccines.malaria_prophylaxis IS
    'Whether malaria prophylaxis is prescribed: yes, no, not-required, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.malaria_prophylaxis_drug IS
    'Malaria prophylaxis drug: atovaquone-proguanil, doxycycline, mefloquine, chloroquine, other, or empty.';
COMMENT ON COLUMN assessment_travel_vaccines.travel_vaccines_notes IS
    'Additional notes on travel vaccines.';
