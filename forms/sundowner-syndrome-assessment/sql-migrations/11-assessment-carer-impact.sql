-- 11_assessment_carer_impact.sql
-- Carer impact and support section of the sundowner syndrome assessment.

CREATE TABLE assessment_carer_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    assessment_id UUID NOT NULL UNIQUE
        REFERENCES assessment(id) ON DELETE CASCADE,

    carer_stress_level VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (carer_stress_level IN ('none', 'mild', 'moderate', 'severe', '')),
    carer_sleep_disruption VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_sleep_disruption IN ('yes', 'no', '')),
    carer_physical_health_impact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_physical_health_impact IN ('yes', 'no', '')),
    carer_mental_health_impact VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_mental_health_impact IN ('yes', 'no', '')),
    carer_burnout_risk VARCHAR(10) NOT NULL DEFAULT ''
        CHECK (carer_burnout_risk IN ('low', 'moderate', 'high', '')),
    respite_care_available VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (respite_care_available IN ('yes', 'no', '')),
    respite_care_frequency VARCHAR(30) NOT NULL DEFAULT ''
        CHECK (respite_care_frequency IN ('regular', 'occasional', 'never', '')),
    formal_support_services VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (formal_support_services IN ('yes', 'no', '')),
    formal_support_details TEXT NOT NULL DEFAULT '',
    carer_training_received VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_training_received IN ('yes', 'no', '')),
    carer_support_group VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (carer_support_group IN ('yes', 'no', '')),
    safeguarding_concerns VARCHAR(5) NOT NULL DEFAULT ''
        CHECK (safeguarding_concerns IN ('yes', 'no', '')),
    safeguarding_details TEXT NOT NULL DEFAULT '',
    carer_impact_notes TEXT NOT NULL DEFAULT '',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_assessment_carer_impact_updated_at
    BEFORE UPDATE ON assessment_carer_impact
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE assessment_carer_impact IS
    'Carer impact and support section: carer stress, respite, support services, and safeguarding. One-to-one child of assessment.';
COMMENT ON COLUMN assessment_carer_impact.assessment_id IS
    'Foreign key to the parent assessment (unique, enforcing 1:1).';
COMMENT ON COLUMN assessment_carer_impact.carer_stress_level IS
    'Carer stress level: none, mild, moderate, severe, or empty.';
COMMENT ON COLUMN assessment_carer_impact.carer_sleep_disruption IS
    'Whether the carer sleep is disrupted by sundowning episodes: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.carer_physical_health_impact IS
    'Whether caring has impacted the carer physical health: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.carer_mental_health_impact IS
    'Whether caring has impacted the carer mental health: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.carer_burnout_risk IS
    'Risk of carer burnout: low, moderate, high, or empty.';
COMMENT ON COLUMN assessment_carer_impact.respite_care_available IS
    'Whether respite care is available: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.respite_care_frequency IS
    'Frequency of respite care: regular, occasional, never, or empty.';
COMMENT ON COLUMN assessment_carer_impact.formal_support_services IS
    'Whether formal support services are in place: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.formal_support_details IS
    'Details of formal support services in place.';
COMMENT ON COLUMN assessment_carer_impact.carer_training_received IS
    'Whether the carer has received training on managing sundowning: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.carer_support_group IS
    'Whether the carer attends a support group: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.safeguarding_concerns IS
    'Whether there are safeguarding concerns: yes, no, or empty.';
COMMENT ON COLUMN assessment_carer_impact.safeguarding_details IS
    'Details of any safeguarding concerns.';
COMMENT ON COLUMN assessment_carer_impact.carer_impact_notes IS
    'Additional clinician notes on carer impact and support.';
