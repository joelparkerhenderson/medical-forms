-- 10_administration_record.sql
-- Vaccine administration record section (Step 9).

CREATE TABLE administration_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    vaccine_name VARCHAR(255) NOT NULL DEFAULT '',
    batch_number VARCHAR(50) NOT NULL DEFAULT '',
    expiry_date DATE,
    administration_site VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (administration_site IN ('leftDeltoid', 'rightDeltoid', 'leftThigh', 'rightThigh', 'oral', 'nasal', '')),
    administration_route VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (administration_route IN ('intramuscular', 'subcutaneous', 'intradermal', 'oral', 'nasal', '')),
    dose_number VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (dose_number IN ('1', '2', '3', 'booster', '')),
    administered_by VARCHAR(255) NOT NULL DEFAULT '',
    administration_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_administration_record_updated_at
    BEFORE UPDATE ON administration_record
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE administration_record IS
    'Vaccine administration details including batch, site, and route. One-to-one child of assessment.';
