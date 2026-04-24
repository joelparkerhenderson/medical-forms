CREATE TABLE patient_medication (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medication(id) ON DELETE CASCADE,
);

CREATE TRIGGER trigger_patient_medication_updated_at
    BEFORE UPDATE ON patient_medication
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE INDEX patient_medication_patient_id_index
    ON patient_medication (patient_id);

CREATE INDEX patient_medication_medication_id_index
    ON patient_medication (medication_id);
    
CREATE UNIQUE INDEX patient_medication_patient_id_medication_id_index
    ON patient_medication (patient_id, medication_id);

COMMENT ON TABLE patient_medication IS
    'Patient medication.';
COMMENT ON COLUMN patient_medication.created_at IS
    'Timestamp when this row was created.';
COMMENT ON COLUMN patient_medication.updated_at IS
    'Timestamp when this row was last updated.';
COMMENT ON COLUMN patient_medication.deleted_at IS
    'Soft-delete timestamp; NULL when the row is live.';
COMMENT ON COLUMN patient_medication.patient_id IS
    'Foreign key to the patient table.';
COMMENT ON COLUMN patient_medication.medication_id IS
    'Foreign key to the medication table.';
