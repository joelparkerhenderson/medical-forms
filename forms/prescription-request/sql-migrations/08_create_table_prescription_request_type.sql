CREATE TABLE prescription_request_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    is_new_prescription VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (is_new_prescription IN ('yes', 'no', '')),
    is_emergency VARCHAR(3) NOT NULL DEFAULT ''
        CHECK (is_emergency IN ('yes', 'no', '')),
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_prescription_request_type_updated_at
    BEFORE UPDATE ON prescription_request_type
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_request_type IS
    'Request type flags for a prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN prescription_request_type.is_new_prescription IS 'Whether this is a new prescription (yes) or a refill (no).';
COMMENT ON COLUMN prescription_request_type.is_emergency IS 'Whether this is an emergency prescription request: yes, no, or empty.';
COMMENT ON COLUMN prescription_request_type.additional_notes IS 'Additional notes about the request.';
--rollback DROP TABLE prescription_request_type;

COMMENT ON COLUMN prescription_request_type.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN prescription_request_type.prescription_request_id IS
    'Foreign key to the prescription_request table.';
COMMENT ON COLUMN prescription_request_type.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN prescription_request_type.updated_at IS
    'Timestamp when this row was last updated.';
