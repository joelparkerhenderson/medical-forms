-- 11-assessment-haematology.sql
-- Step 9: haematology and coagulation.

CREATE TABLE assessment_haematology (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    hb_g_l INTEGER,
    wcc_10_9_l NUMERIC(4,1),
    platelets_10_9_l INTEGER,
    mcv_fl NUMERIC(4,1),
    ferritin_ug_l INTEGER,
    transferrin_saturation_percent NUMERIC(4,1),

    inr NUMERIC(4,2),
    aptt_seconds NUMERIC(4,1),
    fibrinogen_g_l NUMERIC(3,1),

    on_anticoagulant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_anticoagulant IN ('yes', 'no', '')),
    anticoagulant_type VARCHAR(50) NOT NULL DEFAULT ''
        CHECK (anticoagulant_type IN ('warfarin', 'apixaban', 'rivaroxaban', 'edoxaban', 'dabigatran', 'lmwh', 'heparin-iv', 'aspirin', 'clopidogrel', 'ticagrelor', 'none', '')),
    anticoagulant_hold_plan VARCHAR(255) NOT NULL DEFAULT '',

    group_and_save VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (group_and_save IN ('not-required', 'ordered', 'valid', 'expired', '')),
    crossmatch_units INTEGER,
    last_transfusion_date DATE,

    anaemia_severity VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (anaemia_severity IN ('none', 'mild', 'moderate', 'severe', '')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_haematology_updated_at
    BEFORE UPDATE ON assessment_haematology
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_haematology IS
    'Step 9: haematology indices, coagulation, anticoagulant reconciliation, and transfusion status.';
COMMENT ON COLUMN assessment_haematology.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_haematology.hb_g_l IS
    'Haemoglobin in g/L.';
COMMENT ON COLUMN assessment_haematology.wcc_10_9_l IS
    'White cell count in 10^9/L.';
COMMENT ON COLUMN assessment_haematology.platelets_10_9_l IS
    'Platelet count in 10^9/L.';
COMMENT ON COLUMN assessment_haematology.mcv_fl IS
    'Mean corpuscular volume in fL.';
COMMENT ON COLUMN assessment_haematology.ferritin_ug_l IS
    'Ferritin in micrograms per litre.';
COMMENT ON COLUMN assessment_haematology.transferrin_saturation_percent IS
    'Transferrin saturation percentage.';
COMMENT ON COLUMN assessment_haematology.inr IS
    'International normalised ratio.';
COMMENT ON COLUMN assessment_haematology.aptt_seconds IS
    'Activated partial thromboplastin time in seconds.';
COMMENT ON COLUMN assessment_haematology.fibrinogen_g_l IS
    'Fibrinogen in g/L.';
COMMENT ON COLUMN assessment_haematology.on_anticoagulant IS
    'Whether patient is on anticoagulant or antiplatelet therapy.';
COMMENT ON COLUMN assessment_haematology.anticoagulant_type IS
    'Type of anticoagulant or antiplatelet.';
COMMENT ON COLUMN assessment_haematology.anticoagulant_hold_plan IS
    'Plan for holding / bridging anticoagulation perioperatively.';
COMMENT ON COLUMN assessment_haematology.group_and_save IS
    'Group and save status: not-required, ordered, valid, expired.';
COMMENT ON COLUMN assessment_haematology.crossmatch_units IS
    'Number of units crossmatched.';
COMMENT ON COLUMN assessment_haematology.last_transfusion_date IS
    'Date of last red-cell or platelet transfusion.';
COMMENT ON COLUMN assessment_haematology.anaemia_severity IS
    'Clinician categorisation of anaemia: none, mild, moderate, severe.';
