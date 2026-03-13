-- 05_assessment_symptom_assessment.sql
-- Symptom assessment section of the pulmonology assessment.

CREATE TABLE assessment_symptom_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    mrc_dyspnoea_grade INTEGER
        CHECK (mrc_dyspnoea_grade IS NULL OR (mrc_dyspnoea_grade >= 1 AND mrc_dyspnoea_grade <= 5)),
    cat_score INTEGER
        CHECK (cat_score IS NULL OR (cat_score >= 0 AND cat_score <= 40)),
    cough_severity VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (cough_severity IN ('none', 'mild', 'moderate', 'severe', '')),
    sputum_volume VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (sputum_volume IN ('none', 'small', 'moderate', 'copious', '')),
    wheeze_frequency VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (wheeze_frequency IN ('never', 'occasional', 'frequent', 'constant', '')),
    chest_tightness VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (chest_tightness IN ('none', 'mild', 'moderate', 'severe', '')),
    exercise_tolerance TEXT NOT NULL DEFAULT '',
    walking_distance_metres INTEGER
        CHECK (walking_distance_metres IS NULL OR walking_distance_metres >= 0),
    six_minute_walk_distance INTEGER
        CHECK (six_minute_walk_distance IS NULL OR six_minute_walk_distance >= 0),
    oxygen_saturation_rest NUMERIC(4,1)
        CHECK (oxygen_saturation_rest IS NULL OR (oxygen_saturation_rest >= 50.0 AND oxygen_saturation_rest <= 100.0)),
    oxygen_saturation_exercise NUMERIC(4,1)
        CHECK (oxygen_saturation_exercise IS NULL OR (oxygen_saturation_exercise >= 50.0 AND oxygen_saturation_exercise <= 100.0)),
    sleep_disturbance VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (sleep_disturbance IN ('yes', 'no', '')),
    sleep_details TEXT NOT NULL DEFAULT '',
    additional_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_symptom_assessment_updated_at
    BEFORE UPDATE ON assessment_symptom_assessment
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_symptom_assessment IS
    'Symptom assessment section: MRC dyspnoea grade, CAT score, cough, sputum, wheeze, exercise tolerance, and oxygen saturation. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_symptom_assessment.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_symptom_assessment.mrc_dyspnoea_grade IS
    'Medical Research Council dyspnoea scale grade (1-5).';
COMMENT ON COLUMN assessment_symptom_assessment.cat_score IS
    'COPD Assessment Test (CAT) score (0-40).';
COMMENT ON COLUMN assessment_symptom_assessment.cough_severity IS
    'Severity of cough: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.sputum_volume IS
    'Volume of sputum production: none, small, moderate, copious, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.wheeze_frequency IS
    'Frequency of wheezing: never, occasional, frequent, constant, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.chest_tightness IS
    'Severity of chest tightness: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_symptom_assessment.walking_distance_metres IS
    'Maximum walking distance before breathlessness in metres.';
COMMENT ON COLUMN assessment_symptom_assessment.six_minute_walk_distance IS
    'Six-minute walk test distance in metres.';
COMMENT ON COLUMN assessment_symptom_assessment.oxygen_saturation_rest IS
    'Oxygen saturation (SpO2) at rest in percentage.';
COMMENT ON COLUMN assessment_symptom_assessment.oxygen_saturation_exercise IS
    'Oxygen saturation (SpO2) during exercise in percentage.';
