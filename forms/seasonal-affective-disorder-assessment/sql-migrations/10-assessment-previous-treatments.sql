-- 10_assessment_previous_treatments.sql
-- Previous treatments section of the seasonal affective disorder assessment.

CREATE TABLE assessment_previous_treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    previous_sad_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_sad_diagnosis IN ('yes', 'no', '')),
    previous_depression_diagnosis VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_depression_diagnosis IN ('yes', 'no', '')),
    on_antidepressant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (on_antidepressant IN ('yes', 'no', '')),
    antidepressant_details TEXT NOT NULL DEFAULT '',
    previous_antidepressant VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_antidepressant IN ('yes', 'no', '')),
    previous_antidepressant_details TEXT NOT NULL DEFAULT '',
    previous_light_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_light_therapy IN ('yes', 'no', '')),
    light_therapy_response VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (light_therapy_response IN ('good', 'partial', 'no-response', '')),
    previous_cbt VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_cbt IN ('yes', 'no', '')),
    cbt_response VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (cbt_response IN ('good', 'partial', 'no-response', '')),
    previous_other_therapy VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (previous_other_therapy IN ('yes', 'no', '')),
    other_therapy_details TEXT NOT NULL DEFAULT '',
    vitamin_d_supplementation VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (vitamin_d_supplementation IN ('yes', 'no', '')),
    medication_adherence VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (medication_adherence IN ('good', 'moderate', 'poor', '')),
    treatment_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_previous_treatments_updated_at
    BEFORE UPDATE ON assessment_previous_treatments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_previous_treatments IS
    'Previous treatments section: medications, light therapy, CBT, and other interventions. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_previous_treatments.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_previous_treatments.previous_sad_diagnosis IS
    'Whether the patient has a previous SAD diagnosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.previous_depression_diagnosis IS
    'Whether the patient has a previous depression diagnosis: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.on_antidepressant IS
    'Whether the patient is currently on antidepressant medication: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.antidepressant_details IS
    'Details of current antidepressant including drug name, dose, and duration.';
COMMENT ON COLUMN assessment_previous_treatments.previous_antidepressant IS
    'Whether the patient has previously taken antidepressants: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.previous_antidepressant_details IS
    'Details of previous antidepressant use.';
COMMENT ON COLUMN assessment_previous_treatments.previous_light_therapy IS
    'Whether the patient has previously tried light therapy: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.light_therapy_response IS
    'Response to previous light therapy: good, partial, no-response, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.previous_cbt IS
    'Whether the patient has previously had CBT: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.cbt_response IS
    'Response to previous CBT: good, partial, no-response, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.previous_other_therapy IS
    'Whether the patient has tried other therapies: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.other_therapy_details IS
    'Details of other therapies tried.';
COMMENT ON COLUMN assessment_previous_treatments.vitamin_d_supplementation IS
    'Whether the patient takes vitamin D supplements: yes, no, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.medication_adherence IS
    'Self-reported medication adherence: good, moderate, poor, or empty.';
COMMENT ON COLUMN assessment_previous_treatments.treatment_notes IS
    'Additional clinician notes on previous treatments.';
