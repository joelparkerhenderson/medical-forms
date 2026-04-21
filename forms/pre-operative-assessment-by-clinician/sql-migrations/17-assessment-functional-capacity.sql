-- 17-assessment-functional-capacity.sql
-- Step 14: functional capacity and frailty.

CREATE TABLE assessment_functional_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mets_estimate NUMERIC(3,1),
    dasi_score NUMERIC(4,1),
    ecog_performance_status INTEGER
        CHECK (ecog_performance_status IS NULL OR ecog_performance_status BETWEEN 0 AND 4),
    clinical_frailty_scale INTEGER
        CHECK (clinical_frailty_scale IS NULL OR clinical_frailty_scale BETWEEN 1 AND 9),

    six_minute_walk_metres INTEGER,
    sts_one_minute_reps INTEGER,
    tug_seconds NUMERIC(4,1),

    cpet_performed VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (cpet_performed IN ('yes', 'no', '')),
    cpet_vo2_peak_ml_kg_min NUMERIC(4,1),
    cpet_anaerobic_threshold_ml_kg_min NUMERIC(4,1),
    cpet_notes TEXT NOT NULL DEFAULT '',

    malnutrition_risk VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (malnutrition_risk IN ('none', 'low', 'medium', 'high', '')),
    unintentional_weight_loss_kg NUMERIC(4,1),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_functional_capacity_updated_at
    BEFORE UPDATE ON assessment_functional_capacity
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_functional_capacity IS
    'Step 14: functional capacity (METs, DASI, ECOG), Clinical Frailty Scale, CPET, and nutritional-risk summary.';
COMMENT ON COLUMN assessment_functional_capacity.assessment_id IS
    'Foreign key to the parent assessment (unique, 1:1).';
COMMENT ON COLUMN assessment_functional_capacity.mets_estimate IS
    'Metabolic equivalents of task, clinician estimate.';
COMMENT ON COLUMN assessment_functional_capacity.dasi_score IS
    'Duke Activity Status Index score.';
COMMENT ON COLUMN assessment_functional_capacity.ecog_performance_status IS
    'ECOG performance status (0-4).';
COMMENT ON COLUMN assessment_functional_capacity.clinical_frailty_scale IS
    'Rockwood Clinical Frailty Scale (1-9).';
COMMENT ON COLUMN assessment_functional_capacity.six_minute_walk_metres IS
    'Distance walked in a 6-minute walk test in metres.';
COMMENT ON COLUMN assessment_functional_capacity.sts_one_minute_reps IS
    'Number of repetitions in a 1-minute sit-to-stand test.';
COMMENT ON COLUMN assessment_functional_capacity.tug_seconds IS
    'Timed Up-and-Go test result in seconds.';
COMMENT ON COLUMN assessment_functional_capacity.cpet_performed IS
    'Whether cardiopulmonary exercise testing was performed.';
COMMENT ON COLUMN assessment_functional_capacity.cpet_vo2_peak_ml_kg_min IS
    'CPET peak VO2 in mL/kg/min.';
COMMENT ON COLUMN assessment_functional_capacity.cpet_anaerobic_threshold_ml_kg_min IS
    'CPET anaerobic threshold in mL/kg/min.';
COMMENT ON COLUMN assessment_functional_capacity.cpet_notes IS
    'Free-text CPET summary.';
COMMENT ON COLUMN assessment_functional_capacity.malnutrition_risk IS
    'Malnutrition risk (MUST / NRS-2002 equivalent): none, low, medium, high.';
COMMENT ON COLUMN assessment_functional_capacity.unintentional_weight_loss_kg IS
    'Unintentional weight loss in the last 3-6 months, in kg.';
