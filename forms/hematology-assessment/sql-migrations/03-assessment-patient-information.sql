-- ============================================================
-- 03_assessment_patient_information.sql
-- Step 1: Patient Information (1:1 with assessment).
-- ============================================================
-- Patient demographics and specimen details for the
-- hematology assessment.
-- ============================================================

CREATE TABLE assessment_patient_information (
    -- Primary key
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 1:1 relationship with assessment
    assessment_id           UUID NOT NULL UNIQUE REFERENCES assessment(id) ON DELETE CASCADE,

    -- Patient information fields
    patient_name            TEXT NOT NULL DEFAULT '',
    date_of_birth           TEXT NOT NULL DEFAULT '',
    medical_record_number   TEXT NOT NULL DEFAULT '',
    referring_physician     TEXT NOT NULL DEFAULT '',
    clinical_indication     TEXT NOT NULL DEFAULT '',
    specimen_date           TEXT NOT NULL DEFAULT '',
    specimen_type           TEXT NOT NULL DEFAULT '',

    -- Audit timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE TRIGGER trg_assessment_patient_information_updated_at
    BEFORE UPDATE ON assessment_patient_information
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_patient_information IS
    '1:1 with assessment. Step 1: Patient Information - demographics and specimen details.';
COMMENT ON COLUMN assessment_patient_information.id IS
    'UUIDv4 primary key, auto-generated.';
COMMENT ON COLUMN assessment_patient_information.assessment_id IS
    'FK to assessment (UNIQUE = 1:1 relationship).';
COMMENT ON COLUMN assessment_patient_information.patient_name IS
    'Patient full name. Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.date_of_birth IS
    'Date of birth (ISO 8601). Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.medical_record_number IS
    'Medical record number. Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.referring_physician IS
    'Referring physician name. Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.clinical_indication IS
    'Reason for hematology assessment. Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.specimen_date IS
    'Date specimen was collected (ISO 8601). Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.specimen_type IS
    'Type of specimen (e.g. venous blood, capillary blood). Empty string if unanswered.';
COMMENT ON COLUMN assessment_patient_information.created_at IS
    'Row creation timestamp.';
COMMENT ON COLUMN assessment_patient_information.updated_at IS
    'Last modification timestamp, auto-updated by trigger.';
