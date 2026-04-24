CREATE TABLE prescription_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    patient_id UUID NOT NULL
        REFERENCES patient(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL
        REFERENCES clinician(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected'))
);

CREATE TRIGGER trigger_prescription_request_updated_at
    BEFORE UPDATE ON prescription_request
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_request IS
    'Top-level prescription request linking patient and clinician. Parent entity for all prescription sections.';
COMMENT ON COLUMN prescription_request.patient_id IS 'Foreign key to the patient requesting the prescription.';
COMMENT ON COLUMN prescription_request.clinician_id IS 'Foreign key to the prescribing clinician.';
COMMENT ON COLUMN prescription_request.status IS 'Lifecycle status: draft, submitted, reviewed, approved, or rejected.';
COMMENT ON COLUMN prescription_request.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN prescription_request.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN prescription_request.updated_at IS
    'Timestamp when this row was updated.';
COMMENT ON COLUMN prescription_request.deleted_at IS
    'Timestamp when this row was deleted.';
--rollback DROP TABLE prescription_request;

