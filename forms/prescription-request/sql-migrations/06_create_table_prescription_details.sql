CREATE TABLE prescription_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    prescription_request_id UUID NOT NULL UNIQUE
        REFERENCES prescription_request(id) ON DELETE CASCADE,

    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    medication_name VARCHAR(500) NOT NULL DEFAULT '',
    dosage VARCHAR(255) NOT NULL DEFAULT '',
    frequency VARCHAR(255) NOT NULL DEFAULT '',
    route_of_administration VARCHAR(100) NOT NULL DEFAULT ''
        CHECK (route_of_administration IN ('oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhaled', 'rectal', 'sublingual', 'transdermal', 'other', '')),
    treatment_instructions TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_prescription_details_updated_at
    BEFORE UPDATE ON prescription_details
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE prescription_details IS
    'Medication, dosage, and treatment details for a prescription request. One-to-one child of prescription_request.';
COMMENT ON COLUMN prescription_details.request_date IS 'Date the prescription is requested for.';
COMMENT ON COLUMN prescription_details.medication_name IS 'Name of the medication being prescribed.';
COMMENT ON COLUMN prescription_details.dosage IS 'Dosage amount and unit (e.g. 500mg, 10ml).';
COMMENT ON COLUMN prescription_details.frequency IS 'How often the medication should be taken (e.g. BD, TDS, OD).';
COMMENT ON COLUMN prescription_details.route_of_administration IS 'Route: oral, topical, intravenous, intramuscular, subcutaneous, inhaled, rectal, sublingual, transdermal, other, or empty.';
COMMENT ON COLUMN prescription_details.treatment_instructions IS 'Free-text treatment instructions for the patient.';
--rollback DROP TABLE prescription_details;

COMMENT ON COLUMN prescription_details.id IS
    'Primary key UUID, auto-generated.';
COMMENT ON COLUMN prescription_details.prescription_request_id IS
    'Foreign key to the prescription_request table.';
COMMENT ON COLUMN prescription_details.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN prescription_details.updated_at IS
    'Timestamp when this row was last updated.';
