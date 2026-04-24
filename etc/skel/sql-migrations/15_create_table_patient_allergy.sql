CREATE TABLE patient_allergy (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
    allergy_id UUID NOT NULL REFERENCES medication(id) ON DELETE CASCADE,
);

CREATE TRIGGER trigger_patient_allergy_updated_at
    BEFORE UPDATE ON patient_allergy
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE INDEX patient_allergy_patient_id_index
    ON patient_allergy (patient_id);

CREATE INDEX patient_allergy_allergy_id_index
    ON patient_allergy (allergy_id);
    
CREATE UNIQUE INDEX patient_allergy_patient_id_allergy_id_index
    ON patient_allergy (patient_id, allergy_id);
