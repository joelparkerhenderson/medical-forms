-- 07_assessment_haematological.sql
-- Haematological assessment section of the bone marrow donation assessment.

CREATE TABLE assessment_haematological (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    haemoglobin NUMERIC(4,1)
        CHECK (haemoglobin IS NULL OR haemoglobin >= 0),
    white_cell_count NUMERIC(5,1)
        CHECK (white_cell_count IS NULL OR white_cell_count >= 0),
    platelet_count INTEGER
        CHECK (platelet_count IS NULL OR platelet_count >= 0),
    neutrophil_count NUMERIC(5,1)
        CHECK (neutrophil_count IS NULL OR neutrophil_count >= 0),
    lymphocyte_count NUMERIC(5,1)
        CHECK (lymphocyte_count IS NULL OR lymphocyte_count >= 0),
    haematocrit NUMERIC(4,1)
        CHECK (haematocrit IS NULL OR (haematocrit >= 0 AND haematocrit <= 100)),
    mcv NUMERIC(5,1)
        CHECK (mcv IS NULL OR mcv >= 0),
    blood_group VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '')),
    coagulation_screen VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (coagulation_screen IN ('normal', 'abnormal', 'pending', '')),
    coagulation_details TEXT NOT NULL DEFAULT '',
    ferritin NUMERIC(7,1)
        CHECK (ferritin IS NULL OR ferritin >= 0),
    creatinine NUMERIC(6,1)
        CHECK (creatinine IS NULL OR creatinine >= 0),
    liver_function VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (liver_function IN ('normal', 'abnormal', 'pending', '')),
    liver_function_details TEXT NOT NULL DEFAULT '',
    haematological_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_haematological_updated_at
    BEFORE UPDATE ON assessment_haematological
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_haematological IS
    'Haematological assessment section: full blood count, blood group, coagulation, biochemistry. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_haematological.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_haematological.haemoglobin IS
    'Haemoglobin level in g/dL.';
COMMENT ON COLUMN assessment_haematological.white_cell_count IS
    'White cell count in x10^9/L.';
COMMENT ON COLUMN assessment_haematological.platelet_count IS
    'Platelet count in x10^9/L.';
COMMENT ON COLUMN assessment_haematological.neutrophil_count IS
    'Neutrophil count in x10^9/L.';
COMMENT ON COLUMN assessment_haematological.lymphocyte_count IS
    'Lymphocyte count in x10^9/L.';
COMMENT ON COLUMN assessment_haematological.haematocrit IS
    'Haematocrit percentage.';
COMMENT ON COLUMN assessment_haematological.mcv IS
    'Mean corpuscular volume in fL.';
COMMENT ON COLUMN assessment_haematological.blood_group IS
    'ABO and Rh blood group.';
COMMENT ON COLUMN assessment_haematological.coagulation_screen IS
    'Coagulation screen result: normal, abnormal, pending, or empty.';
COMMENT ON COLUMN assessment_haematological.ferritin IS
    'Serum ferritin level in ng/mL.';
COMMENT ON COLUMN assessment_haematological.creatinine IS
    'Serum creatinine in umol/L.';
COMMENT ON COLUMN assessment_haematological.liver_function IS
    'Liver function tests result: normal, abnormal, pending, or empty.';
COMMENT ON COLUMN assessment_haematological.haematological_notes IS
    'Additional clinician notes on haematological assessment.';
