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

CREATE TRIGGER trigger_administration_record_updated_at
    BEFORE UPDATE ON administration_record
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE administration_record IS
    'Vaccine administration details including batch, site, and route. One-to-one child of assessment.';

COMMENT ON COLUMN administration_record.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN administration_record.assessment_id IS
    'Foreign key to the assessment table.';
COMMENT ON COLUMN administration_record.vaccine_name IS
    'Vaccine name.';
COMMENT ON COLUMN administration_record.batch_number IS
    'Batch number.';
COMMENT ON COLUMN administration_record.expiry_date IS
    'Expiry date.';
COMMENT ON COLUMN administration_record.administration_site IS
    'Administration site. One of: leftDeltoid, rightDeltoid, leftThigh, rightThigh, oral, nasal.';
COMMENT ON COLUMN administration_record.administration_route IS
    'Administration route. One of: intramuscular, subcutaneous, intradermal, oral, nasal.';
COMMENT ON COLUMN administration_record.dose_number IS
    'Dose number. One of: 1, 2, 3, booster.';
COMMENT ON COLUMN administration_record.administered_by IS
    'Administered by.';
COMMENT ON COLUMN administration_record.administration_date IS
    'Administration date.';
COMMENT ON COLUMN administration_record.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN administration_record.updated_at IS
    'Timestamp when this row was last updated.';
