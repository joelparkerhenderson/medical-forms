-- 05_assessment_behavioural_symptoms.sql
-- Behavioural symptoms section of the sundowner syndrome assessment.

CREATE TABLE assessment_behavioural_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    agitation_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (agitation_level IN ('none', 'mild', 'moderate', 'severe', '')),
    verbal_aggression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (verbal_aggression IN ('yes', 'no', '')),
    physical_aggression VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (physical_aggression IN ('yes', 'no', '')),
    wandering VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (wandering IN ('yes', 'no', '')),
    wandering_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (wandering_risk IN ('low', 'moderate', 'high', '')),
    pacing VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (pacing IN ('yes', 'no', '')),
    repetitive_behaviours VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (repetitive_behaviours IN ('yes', 'no', '')),
    repetitive_behaviours_details TEXT NOT NULL DEFAULT '',
    hallucinations VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (hallucinations IN ('yes', 'no', '')),
    hallucination_type VARCHAR(20) NOT NULL DEFAULT ''
        CHECK (hallucination_type IN ('visual', 'auditory', 'both', 'other', '')),
    delusions VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (delusions IN ('yes', 'no', '')),
    anxiety VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (anxiety IN ('none', 'mild', 'moderate', 'severe', '')),
    depression VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (depression IN ('none', 'mild', 'moderate', 'severe', '')),
    cmai_score INTEGER
        CHECK (cmai_score IS NULL OR (cmai_score >= 29 AND cmai_score <= 203)),
    npi_total_score INTEGER
        CHECK (npi_total_score IS NULL OR (npi_total_score >= 0 AND npi_total_score <= 144)),
    self_harm_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (self_harm_risk IN ('yes', 'no', '')),
    harm_to_others_risk VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (harm_to_others_risk IN ('yes', 'no', '')),
    behavioural_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_behavioural_symptoms_updated_at
    BEFORE UPDATE ON assessment_behavioural_symptoms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_behavioural_symptoms IS
    'Behavioural symptoms section: agitation, aggression, wandering, hallucinations, CMAI and NPI scores. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_behavioural_symptoms.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_behavioural_symptoms.agitation_level IS
    'Overall agitation level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.verbal_aggression IS
    'Whether the patient exhibits verbal aggression: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.physical_aggression IS
    'Whether the patient exhibits physical aggression: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.wandering IS
    'Whether the patient wanders: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.wandering_risk IS
    'Risk level of wandering behaviour: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.pacing IS
    'Whether the patient paces repetitively: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.repetitive_behaviours IS
    'Whether the patient exhibits repetitive behaviours: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.repetitive_behaviours_details IS
    'Details of repetitive behaviours.';
COMMENT ON COLUMN assessment_behavioural_symptoms.hallucinations IS
    'Whether the patient experiences hallucinations: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.hallucination_type IS
    'Type of hallucinations: visual, auditory, both, other, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.delusions IS
    'Whether the patient experiences delusions: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.anxiety IS
    'Anxiety level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.depression IS
    'Depression level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.cmai_score IS
    'Cohen-Mansfield Agitation Inventory total score (29-203).';
COMMENT ON COLUMN assessment_behavioural_symptoms.npi_total_score IS
    'Neuropsychiatric Inventory total score (0-144).';
COMMENT ON COLUMN assessment_behavioural_symptoms.self_harm_risk IS
    'Whether the patient is at risk of self-harm: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.harm_to_others_risk IS
    'Whether the patient poses a risk of harm to others: yes, no, or empty.';
COMMENT ON COLUMN assessment_behavioural_symptoms.behavioural_notes IS
    'Additional clinician notes on behavioural symptoms.';
