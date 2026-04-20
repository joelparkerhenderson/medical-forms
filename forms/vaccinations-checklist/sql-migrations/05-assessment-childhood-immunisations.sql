-- 05_assessment_childhood_immunisations.sql
-- Childhood immunisations section of the vaccinations checklist.

CREATE TABLE assessment_childhood_immunisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mmr_dose_1 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mmr_dose_1 IN ('yes', 'no', 'unknown', '')),
    mmr_dose_1_date DATE,
    mmr_dose_2 VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (mmr_dose_2 IN ('yes', 'no', 'unknown', '')),
    mmr_dose_2_date DATE,
    dtp_primary_course VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dtp_primary_course IN ('yes', 'no', 'unknown', '')),
    dtp_primary_date DATE,
    dtp_booster VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (dtp_booster IN ('yes', 'no', 'unknown', '')),
    dtp_booster_date DATE,
    polio_primary_course VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polio_primary_course IN ('yes', 'no', 'unknown', '')),
    polio_primary_date DATE,
    polio_booster VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (polio_booster IN ('yes', 'no', 'unknown', '')),
    polio_booster_date DATE,
    hib_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hib_vaccine IN ('yes', 'no', 'unknown', '')),
    hib_vaccine_date DATE,
    men_c_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (men_c_vaccine IN ('yes', 'no', 'unknown', '')),
    men_c_vaccine_date DATE,
    men_acwy_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (men_acwy_vaccine IN ('yes', 'no', 'unknown', '')),
    men_acwy_vaccine_date DATE,
    pcv_vaccine VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pcv_vaccine IN ('yes', 'no', 'unknown', '')),
    pcv_vaccine_date DATE,
    childhood_immunisations_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_childhood_immunisations_updated_at
    BEFORE UPDATE ON assessment_childhood_immunisations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_childhood_immunisations IS
    'Childhood immunisations section: MMR, DTP, polio, Hib, MenC, MenACWY, PCV status and dates. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_childhood_immunisations.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_childhood_immunisations.mmr_dose_1 IS
    'Whether MMR dose 1 has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.mmr_dose_1_date IS
    'Date MMR dose 1 was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.mmr_dose_2 IS
    'Whether MMR dose 2 has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.mmr_dose_2_date IS
    'Date MMR dose 2 was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.dtp_primary_course IS
    'Whether DTP primary course is complete: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.dtp_primary_date IS
    'Date DTP primary course was completed.';
COMMENT ON COLUMN assessment_childhood_immunisations.dtp_booster IS
    'Whether DTP booster has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.dtp_booster_date IS
    'Date DTP booster was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.polio_primary_course IS
    'Whether polio primary course is complete: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.polio_primary_date IS
    'Date polio primary course was completed.';
COMMENT ON COLUMN assessment_childhood_immunisations.polio_booster IS
    'Whether polio booster has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.polio_booster_date IS
    'Date polio booster was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.hib_vaccine IS
    'Whether Haemophilus influenzae type b vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.hib_vaccine_date IS
    'Date Hib vaccine was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.men_c_vaccine IS
    'Whether meningococcal C vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.men_c_vaccine_date IS
    'Date MenC vaccine was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.men_acwy_vaccine IS
    'Whether meningococcal ACWY vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.men_acwy_vaccine_date IS
    'Date MenACWY vaccine was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.pcv_vaccine IS
    'Whether pneumococcal conjugate vaccine has been received: yes, no, unknown, or empty.';
COMMENT ON COLUMN assessment_childhood_immunisations.pcv_vaccine_date IS
    'Date PCV vaccine was administered.';
COMMENT ON COLUMN assessment_childhood_immunisations.childhood_immunisations_notes IS
    'Additional notes on childhood immunisations.';
